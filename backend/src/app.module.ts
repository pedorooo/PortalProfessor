import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { ClassesModule } from './classes/classes.module';
import { ProfessorsModule } from './professors/professors.module';
import { EvaluationsModule } from './evaluations/evaluations.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    StudentsModule,
    ClassesModule,
    ProfessorsModule,
    EvaluationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
