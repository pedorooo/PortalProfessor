import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService, type PublicUser } from '../users/users.service';
import type { Role } from '@prisma/client';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { createHash, randomBytes } from 'node:crypto';

type RefreshTokenPayload =
  | { type: 'refresh'; sub: number }
  | { type?: string; sub?: number };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(
    email: string,
    plainPassword: string,
  ): Promise<PublicUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const ok = await compare(plainPassword, user.passwordHash);
    if (!ok) return null;
    const { passwordHash, ...rest } = user;
    return rest as PublicUser;
  }

  async login(user: PublicUser) {
    const jwtExpires = process.env.JWT_EXPIRES_IN ?? '3600s';
    const jwtRefreshExpires = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const secret: Secret = (process.env.JWT_SECRET ?? 'secret') as Secret;
    const signOpts: SignOptions = {
      expiresIn: jwtExpires as SignOptions['expiresIn'],
    };

    const accessToken = jwt.sign(
      payload as string | object | Buffer,
      secret,
      signOpts,
    );

    // create a random refresh token, store its hash in DB and return raw token to client
    const refreshToken = randomBytes(48).toString('hex');
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

    // compute expiresAt from refreshOpts.expiresIn (support seconds 's', hours 'h', days 'd')
    const expiresInRaw = jwtRefreshExpires;
    const expiresMs = parseExpiresToMs(expiresInRaw);
    const expiresAt = new Date(Date.now() + expiresMs);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return { accessToken, refreshToken, expiresAt };
  }

  async register(email: string, password: string, name: string, role?: Role) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new BadRequestException('Email already in use');
    const user = await this.usersService.createUser(
      email,
      password,
      name,
      role ?? 'STUDENT',
    );
    return user;
  }

  async refreshToken(token: string) {
    try {
      // verify incoming refresh token by hash lookup
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const tokenRec = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
      });
      if (!tokenRec || tokenRec.revoked || tokenRec.expiresAt < new Date())
        throw new UnauthorizedException();

      const user = await this.usersService.findById(tokenRec.userId);
      if (!user) throw new UnauthorizedException();

      // rotate refresh token: mark old revoked and create a new one
      await this.prisma.refreshToken.update({
        where: { id: tokenRec.id },
        data: { revoked: true },
      });

      const newRefreshToken = randomBytes(48).toString('hex');
      const newHash = createHash('sha256')
        .update(newRefreshToken)
        .digest('hex');
      const expiresMs = parseExpiresToMs(
        process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
      );
      const expiresAt = new Date(Date.now() + expiresMs);
      await this.prisma.refreshToken.create({
        data: { tokenHash: newHash, userId: user.id, expiresAt },
      });

      const jwtExpires = process.env.JWT_EXPIRES_IN ?? '3600s';
      const signOpts: SignOptions = {
        expiresIn: jwtExpires as SignOptions['expiresIn'],
      };
      const access = jwt.sign(
        { sub: String(user.id), email: user.email, role: user.role } as object,
        (process.env.JWT_SECRET ?? 'secret') as Secret,
        signOpts,
      );
      return { accessToken: access, refreshToken: newRefreshToken, expiresAt };
    } catch (err) {
      // log the error for debugging, then return unauthorized
      // eslint-disable-next-line no-console
      console.error(err);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(token: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const tokenRec = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    if (!tokenRec) return false;
    await this.prisma.refreshToken.update({
      where: { id: tokenRec.id },
      data: { revoked: true },
    });
    return true;
  }
}

function parseExpiresToMs(value: string) {
  // supports formats like '3600s', '1h', '7d' or numeric seconds
  if (!value) return 7 * 24 * 3600 * 1000;
  const v = value.toString().trim();
  const last = v.at(-1) ?? '';
  const num = Number(v.slice(0, -1));
  if (!Number.isFinite(num)) {
    const asNum = Number(v);
    if (Number.isFinite(asNum)) return asNum * 1000;
    return 7 * 24 * 3600 * 1000;
  }
  switch (last) {
    case 's':
      return num * 1000;
    case 'm':
      return num * 60 * 1000;
    case 'h':
      return num * 3600 * 1000;
    case 'd':
      return num * 24 * 3600 * 1000;
    default:
      return Number(v) * 1000;
  }
}
