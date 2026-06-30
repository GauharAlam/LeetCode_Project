import  {useState} form "react";

function App(){
    const [form, setForm] = usestate({

    })

    const handleChange = (e)=>{
        setForm({
            ...form,
            [e.target.name]:e.target.value
        });
    };



     return(
        <div>
        <h2>
        Registere Form
        </h2>

        <form>

        // name
            <input 
            type = "text"
            name = "name"
            placeholder = "Enter name"
            onChange={hangleChange}
            >
            </input>

            // email
            <input
            type = "text"
            name = "email"
            placeholder="Enter your email"
            onChange={handleChange}
            >
            </input>


            // password
        
            <input


        </form>
        </div>
     )
}