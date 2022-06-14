import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskStatusDto } from './dtos/update-task-status.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.model';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  getAllTasks(): Task[] {
    return this.tasksService.getAllTasks();
  }

  @Get(`/:id`)
  getTaskById(@Param(`id`) id: string): Task {
    return this.tasksService.getTaskById(id);
  }

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto): Task {
    return this.tasksService.createTask(createTaskDto);
  }

  @Delete(`/:id`)
  deleteTask(@Param(`id`) id: string): void {
    return this.tasksService.deleteTask(id);
  }

  @Patch(`/:id/status`)
  updateTaskStatus(
    @Param(`id`) id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ): Task {
    console.log(updateTaskStatusDto);
    return this.tasksService.updateTaskStatus(id, updateTaskStatusDto.status);
  }
}
