import { GetTasksDTO } from '../DTO/GetTasksDTO.js';
import { CreateTaskDTO } from '../DTO/CreateTaskDTO.js';
import { getTasks, createTask } from '../services/taskService.js';

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
    //update de status
    //ou title ou description ou tudo junto... tanto faz
}

export async function DeleatTask(req, res) {
}
