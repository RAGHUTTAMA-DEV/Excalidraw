import {create} from "zustand";
import {persist,createJSONStorage} from "zustand/middleware";

interface AuthStoreInterface{
    user:JSON;
    token:string;
    isLoading:boolean;
    isError:boolean;
    isSuccess:boolean;
    setUser:(user:JSON)=>void;
    setToken:(token:string)=>void;
    setIsLoading:(isLoading:boolean)=>void;
    setIsError:(isError:boolean)=>void;
    setIsSuccess:(isSuccess:boolean)=>void;
}

const AuthStore = create<AuthStoreInterface>()(
    persist((set)=>({
        user:{} as JSON,
        token:"",
        isLoading:false,
        isError:false,
        isSuccess:false,
        setUser:(user:JSON)=>set({user}),
        setToken:(token:string)=>set({token}),
        setIsLoading:(isLoading:boolean)=>set({isLoading}),
        setIsError:(isError:boolean)=>set({isError}),
        setIsSuccess:(isSuccess:boolean)=>set({isSuccess}),
    }),{
        name:"auth",
        storage:createJSONStorage(()=>localStorage),
    })
)

export default AuthStore;