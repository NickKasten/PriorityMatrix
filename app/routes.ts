import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("auth/callback", "routes/auth.callback.tsx"),
  route("capacity", "routes/capacity.tsx"),
  route("add-todo", "routes/add-todo.tsx"),
  route("add-todo/position", "routes/add-todo.position.tsx"),
  route("todos", "routes/todos.tsx"),
] satisfies RouteConfig;
