import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  UpdateProfileSchema,
  type UpdateProfileDto,
} from './dto/update-profile.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { Request as ExpressRequest } from 'express';

interface AuthRequest extends ExpressRequest {
  user?: { sub: number; email: string; role: string };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: AuthRequest) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersService.toPublicProfile(user);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req: AuthRequest,
    @Body(new ZodValidationPipe(UpdateProfileSchema))
    payload: UpdateProfileDto,
  ) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.usersService.updateProfile(userId, payload);
    return this.usersService.toPublicProfile(updated);
  }

  @Get(':userId')
  async getUser(@Param('userId') userIdParam: string) {
    const userId = Number.parseInt(userIdParam, 10);

    if (Number.isNaN(userId) || !Number.isInteger(userId) || userId < 0) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersService.toPublicProfile(user);
  }
}
