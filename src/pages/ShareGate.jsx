import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/authContext";

export default function ShareGate() {
    const nav = useNavigate();
    const { setUser } = useAuth();
    const search = new URLSearchParams(useLocation().search);

    useEffect(() => {
        const uid = search.get("uid");
        if (!uid || isNaN(uid) ) return;

        const user = {
            user_id: Number(uid),
            created_at: search.get("created") ?? new Date().toISOString(),
            last_logged_in: search.get("last") ?? new Date().toISOString(),
            username: search.get("uname") ?? null,
            email: search.get("email") ?? null,
        };

        setUser(user);
        nav("/");
    }, [search, setUser, nav]);

    return null;
}
