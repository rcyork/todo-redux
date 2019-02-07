import React from "react";
import ReactDOM from "react-dom";
import { createStore, combineReducers } from "redux";
import { Provider, connect } from "react-redux";
import * as serviceWorker from "./serviceWorker";

// reducers
const todo = (state, action) => {
  switch (action.type) {
    case "ADD_TODO":
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case "TOGGLE_TODO":
      if (state.id !== action.id) {
        return state;
      }
      return { ...state, completed: !state.completed };
    default:
      return state;
  }
};

const todos = (state = [], action) => {
  switch (action.type) {
    case "ADD_TODO":
      return [todo(undefined, action), ...state];
    case "TOGGLE_TODO":
      return state.map(t => todo(t, action));
    default:
      return state;
  }
};

const visibilityFilter = (state = "SHOW_ALL", action) => {
  switch (action.type) {
    case "SET_VISIBILITY_FILTER":
      return action.filter;
    default:
      return state;
  }
};

// helper functions
let nextTodoId = 0;
const addTodo = text => {
  return {
    type: "ADD_TODO",
    text,
    id: nextTodoId++
  };
};

const toggleTodo = id => {
  return {
    type: "TOGGLE_TODO",
    id
  };
};

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case "SHOW_ALL":
      return todos;
    case "SHOW_ACTIVE":
      return todos.filter(todo => !todo.completed);
    case "SHOW_COMPLETED":
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
};

// components
let AddTodo = ({ addTodo }) => {
  let todoInput;
  return (
    <>
      <input
        type="text"
        ref={node => {
          todoInput = node;
        }}
      />
      <button
        onClick={e => {
          e.preventDefault();
          addTodo(todoInput.value);
          todoInput.value = "";
        }}
      >
        Add Todo
      </button>
    </>
  );
};
AddTodo = connect(
  null,
  { addTodo }
)(AddTodo);

const Todo = ({ text, completed, onClick }) => (
  <li
    onClick={onClick}
    style={{
      textDecoration: completed ? "line-through" : "none"
    }}
  >
    {text}
  </li>
);
const TodoList = ({ todos, onTodoClick }) => {
  console.log(todos);

  return (
    <ul>
      {todos.map(todo => (
        <Todo
          text={todo.text}
          onClick={() => onTodoClick(todo.id)}
          completed={todo.completed}
        />
      ))}
    </ul>
  );
};
const mapStateToTodoListProps = state => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  };
};
const mapDispatchToTodoListProps = dispatch => {
  return {
    onTodoClick: id => {
      dispatch(toggleTodo(id));
    }
  };
};
const VisibileTodoList = connect(
  mapStateToTodoListProps,
  mapDispatchToTodoListProps
)(TodoList);

const Link = ({ active, onClick, children }) => {
  if (active) {
    return <span>{children}</span>;
  }
  return (
    <a href="#" onClick={onClick}>
      {children}
    </a>
  );
};
const mapStateToLinkProps = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  };
};
const mapDispatchToLinkProps = (dispatch, ownProps) => {
  return {
    onClick: () =>
      dispatch({
        type: "SET_VISIBILITY_FILTER",
        filter: ownProps.filter
      })
  };
};
const FilterLink = connect(
  mapStateToLinkProps,
  mapDispatchToLinkProps
)(Link);

const Footer = () => (
  <p>
    Show: <FilterLink filter="SHOW_ALL">All</FilterLink>{" "}
    <FilterLink filter="SHOW_ACTIVE">Active</FilterLink>{" "}
    <FilterLink filter="SHOW_COMPLETED">Completed</FilterLink>
  </p>
);

const TodoApp = () => (
  <>
    <AddTodo />
    <VisibileTodoList />
    <Footer />
  </>
);

const todoApp = combineReducers({ todos, visibilityFilter });

ReactDOM.render(
  <Provider store={createStore(todoApp)}>
    <TodoApp />
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
