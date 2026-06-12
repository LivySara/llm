import { Component, ReactNode } from "react";
import Counter from "./class-component"

export default class OldReactApi extends Component {
    render(): ReactNode {
        return <Counter />
    }
}