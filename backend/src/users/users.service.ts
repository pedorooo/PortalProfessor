import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'bcrypt';
import type { User, Role } from '@prisma/client';
import type { UpdateProfileDto } from './dto/update-profile.dto';

export type PublicUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(
    email: string,
    password: string,
    name: string,
    role: Role = 'STUDENT',
  ) {
    const passwordHash = await hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
      },
    });
    const { passwordHash: _p, ...publicUser } = user;
    return publicUser as PublicUser;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Convert User to public profile (remove passwordHash)
   */
  toPublicProfile(user: User | null): PublicUser | null {
    if (!user) return null;
    const { passwordHash: _p, ...publicUser } = user;
    return publicUser as PublicUser;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const updateData: Record<string, unknown> = {};

    if ('name' in dto && dto.name !== undefined) {
      updateData.name = dto.name;
    }
    if ('phone' in dto && dto.phone !== undefined) {
      updateData.phone = dto.phone;
    }

    if (Object.keys(updateData).length === 0) {
      return this.findById(userId);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }
}
