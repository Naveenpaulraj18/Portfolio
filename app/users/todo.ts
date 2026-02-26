
import { useEffect, useState } from "react";

interface IusersTodo{

    userId:number;
    id:number;
    title:string;
    completed:boolean;
}

export const useTodofunction =(url:string)=>{
    const [users,setusers]=useState<IusersTodo[]>(
        []
    );

    useEffect(()=>{
        fetch(url)
        .then((res)=>res.json())
        .then((json)=>{
            setusers(json);
        })

    },[url])
    return{users};
    

}