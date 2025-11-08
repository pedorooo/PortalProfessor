import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginSchema, type LoginDto } from './dto/login.dto';
import { RegisterSchema, type RegisterDto } from './dto/register.dto';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: unknown, @Res({ passthrough: true }) res: Response) {
    let payload: LoginDto;
    try {
      payload = LoginSchema.parse(dto);
    } catch (err) {
      throw new BadRequestException(err);
    }

    const user = await this.authService.validateUser(
      payload.email,
      payload.password,
    );
    if (!user) {
      return { status: 'error', message: 'Invalid credentials' };
    }
    const result = await this.authService.login(user);
    // set refresh token as httpOnly cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: result.expiresAt
        ? new Date(result.expiresAt).getTime() - Date.now()
        : undefined,
    };
    res.cookie('refreshToken', result.refreshToken, cookieOptions);
    return { accessToken: result.accessToken };
  }

  @Post('register')
  async register(@Body() dto: unknown) {
    let payload: RegisterDto;
    try {
      payload = RegisterSchema.parse(dto);
    } catch (err) {
      throw new BadRequestException(err);
    }

    const user = await this.authService.register(
      payload.email,
      payload.password,
      payload.name,
      payload.role,
    );
    return { status: 'ok', user };
  }

  @Post('refresh-token')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookie = req.cookies?.refreshToken as string | undefined;
    if (!cookie) {
      throw new BadRequestException('Missing refresh token');
    }
    const result = await this.authService.refreshToken(cookie);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: result.expiresAt
        ? new Date(result.expiresAt).getTime() - Date.now()
        : undefined,
    };
    res.cookie('refreshToken', result.refreshToken, cookieOptions);
    return { accessToken: result.accessToken };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookie = req.cookies?.refreshToken as string | undefined;
    if (cookie) {
      await this.authService.revokeRefreshToken(cookie);
    }
    res.clearCookie('refreshToken', { path: '/' });
    return { status: 'ok' };
  }
}
