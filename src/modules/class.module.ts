import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassController } from 'src/controllers/class.controller';
import { ClassSchema } from 'src/schema/class.schema';
import { ClassService } from 'src/services/class.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'class', schema: ClassSchema }]),
  ],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
})
export class ClassModule {}
