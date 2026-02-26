'use client'
import { useTodofunction } from "./todo";

export const ViewTodo = () => {
  const { users } = useTodofunction(
    "https://jsonplaceholder.typicode.com/todos"
  );
  const usersfilter = users.filter((item) => item.completed === true);
  return (
    <div>
      {users.length === 0 ? (
        <h1>loading...</h1>
      ) : (
        <div>
          {usersfilter.map((item, index) => (
            <li key={index}>{item.title}</li>
          ))}
        </div>
      )}
    </div>
  );
};
