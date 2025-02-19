// in this file bulid a wrapper function
// wrapper function is a higher order function(HOF)

// HOF:
// ✅ Takes another function as an argument (callback function).
// ✅ Returns another function as its result.


// const asyncHandler =()=>{}
// const asyncHandler =(func)=>{}
// const asyncHandler =(func)=>async ()=>{}

// frist approch 
// avoid this prectice
// const asyncHandler = (func)=> async (req ,res, next)=>{
//     try {
//         await func(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500)
//         .json({
//             success: false,
//             message: error.message
//         })
//     }
// }

// second approch [best practices]
const asyncHandler = (requestHandler) =>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}

export {asyncHandler}
