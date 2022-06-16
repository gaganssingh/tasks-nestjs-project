import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dtos/create-task.dto';
import { GetTasksFilterDto } from './dtos/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    const query = this.tasksRepository.createQueryBuilder('task'); // "task" refers to the Task entity

    const { status, search } = filterDto;
    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        'task.title ILIKE :search OR task.description ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const tasks = await query.getMany();
    return tasks;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDto;

    // Create the task instance
    const task = this.tasksRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
    });

    // Save the task instance into the db
    await this.tasksRepository.save(task);
    return task;
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(
        `Task with id: ${id} not found. Nothing to return.`,
      );
    }
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const task = await this.tasksRepository.delete(id);

    if (task.affected === 0) {
      throw new NotFoundException(
        `Task with id: ${id} not found. Nothing deleted.`,
      );
    }
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const task = await this.getTaskById(id);
    task.status = status;
    await this.tasksRepository.save(task);
    return task;
  }
}
