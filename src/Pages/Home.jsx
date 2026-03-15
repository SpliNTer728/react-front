import { useContext } from "react";
import { AppContext } from "../Context/AppContext";

export default function Home() {

    const { name } = useContext(AppContext);

    return (
        <>
        <p>Welcome, {name}!</p>
        </>
    );
}