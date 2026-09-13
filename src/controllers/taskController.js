import { GetTasksDTO } from '../DTO/GetTasksDTO.js';
import { CreateTaskDTO } from '../DTO/CreateTaskDTO.js';
import { UpdateTaskDTO } from '../DTO/UpdateTaskDTO.js';
import { TaskIdDTO } from '../DTO/TaskIdDTO.js';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService.js';

export async function GetTasks(req, res) {
  // pegando a query q eu vou usar no paginate lá
  const dto = new GetTasksDTO(req.query, req.user?.sub);
  const result = await getTasks(dto);
  return res.status(200).json(result);
}

export async function CreateTask(req, res) {
  const dto = new CreateTaskDTO(req.body, req.user?.sub);
  const task = await createTask(dto);
  return res.status(201).json({ task });
}

export async function UpdateTask(req, res) {
  const dto = new UpdateTaskDTO(req.body, req.params.id, req.user?.sub);
  const task = await updateTask(dto);
  return res.status(200).json({ task });
}

export async function DeleateTask(req, res) {
  const dto = new TaskIdDTO(req.params.id, req.user?.sub);
  await deleteTask(dto);
  return res.status(204).send();
}
