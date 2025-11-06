export interface Todo {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  due_date: string | null;
  importance: number;
  urgency: number;
  status: "todo" | "scheduled" | "completed";
  position: number;
  completed_at: string | null;
}
