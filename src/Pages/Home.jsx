import { useContext } from "react";
import { AppContext } from "../Context/AppContext";

export default function Home() {

    const { user } = useContext(AppContext);

    return (
        <>
        <h1 className="title">Last Posts</h1>
        </>
    );
}