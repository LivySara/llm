import { ChangeEvent, Component } from "react";

export default class Counter extends Component {
    state = {
        name: 'livy',
        age: 12
    }
    // 普通函数对于绑定事件，会遇到this丢失，即undefined
    handleNameChange = (e: ChangeEvent) => {
        this.setState({
            name: (e.target as HTMLInputElement).value
        })
    }
    handleAgeChange = () => {
        this.setState({
            age: this.state.age + 1
        })
    }
    render() {
        return (
          <>
            <input
              value={this.state.name}
              onChange={this.handleNameChange}
            />
            <button onClick={this.handleAgeChange}>
              Increment age
            </button>
            <p>Hello, {this.state.name}. You are {this.state.age}.</p>
          </>
        );
    }
}