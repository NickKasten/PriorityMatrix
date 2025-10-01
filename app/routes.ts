import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("add-todo", "routes/add-todo.tsx"),
  route("add-todo/position", "routes/add-todo.position.tsx"),
  route("add-todo/saving", "routes/add-todo.saving.tsx"),
  route("todos", "routes/todos.tsx"),
] satisfies RouteConfig;
