import { useAppStore } from '@/store'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack } from "react-icons/io5"
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { getColor, colors } from '@/lib/utils'
import { FaPlus, FaTrash } from "react-icons/fa"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import apiClient from '@/lib/api-client'
import { ADD_PROFILE_IMAGE_ROUTE, HOST, UPDATE_PROFILE_ROUTE,REMOVE_PROFILE_IMAGE_ROUTE } from '@/utils/constants'

function Profile() {
  const navigate = useNavigate()
  const { userInfo, setUserInfo } = useAppStore()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [image, setImage] = useState(null)
  const [hovered, setHovered] = useState(false)
  const [selectedColor, setSelectedColor] = useState(0)
  const fileInput = useRef(null)

  useEffect(()=>{
   if(userInfo.profileSetup){
    setFirstName(userInfo.firstName)
    setLastName(userInfo.lastName)
    setSelectedColor(userInfo.color)
   }
   if(userInfo.image){
    setImage(`${HOST}/${userInfo.image}`);

   }
  },[userInfo])
  
  const validateProfile =()=>{
    if(!firstName){
      toast.error("Please fill firstName")
      return false
    }
    if(!lastName){
      toast.error("Please fill lastName")
      return false
    }
    return true
  }

  const saveChange = async () => { 
    if(validateProfile()){
       try {
        const resp = await apiClient.post(UPDATE_PROFILE_ROUTE,{firstName,lastName,color:selectedColor},{withCredentials:true})
        if(resp.status === 200 && resp.data){
          setUserInfo({...resp.data})
          toast.success("Profile updated successfully")
          navigate("/chat")
        }
       } catch (error) {
        console.log(error)
       }
    }
  };

  const hdlNavigate =()=>{
    if(userInfo.profileSetup){
      navigate("/chat")
    }else{
      toast.error("Please setup profile")
    }
  }
 
  const hdlFileInput=()=>{
    fileInput.current.click()
  }

  const hdlImageChange= async(e)=>{
    const file = e.target.files[0]
    console.log({file})
    if(file){
      const formData = new FormData()
      formData.append("profile-image",file)
      const resp = await apiClient.post(ADD_PROFILE_IMAGE_ROUTE,formData,{withCredentials:true})
      if(resp.status === 200 && resp.data.image){
        setUserInfo({...userInfo,image:resp.data.image})
        toast.success("Image updated successfully")
      }
      const reader = new FileReader()
      reader.onload=()=>{
        setImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const hdlDeleteImg= async()=>{
    try {
      const resp = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, {withCredentials: true})
      if (resp.status === 200) {
        setUserInfo({...userInfo, image: null})
        setImage(null)
        toast.success("Image removed successfully")
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to remove image")
    }
  }
  return (
    <div className='bg-[#1b1c24] h-[100vh] flex flex-col items-center justify-center gap-10 '>
      <div className="flex flex-col gap-10 w-[80vw]md:w-max">
        <div>
          <IoArrowBack className='text-4xl lg:text-6xl text-white/90 cursor-pointer' onClick={hdlNavigate}/>
        </div>
        <div className='grid grid-cols-2'>
          <div className='h-32 w-32 md:w-48 md:h-48 relative flex items-center justify-center' onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden">
              {
                image ? (<AvatarImage src={image} alt="profile" className="object-cover w-full h-full bg-black" />) : (<div className={`uppercase h-32 w-32 md:h-48 md:w-48 text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor(selectedColor)}`}>
                  {firstName ? firstName.split("").shift() : userInfo.email.split("").shift()}
                </div>
                )}
            </Avatar>
            {
              hovered && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/50 ring-fuchsia-50 rounded-full '
                onClick={image ? hdlDeleteImg : hdlFileInput}
                >
                  {
                    image ? (<FaTrash className='text-white text-3xl cursor-pointer' />) : (<FaPlus className='text-white text-3xl cursor-pointer' />
                    )}
                </div>

              )}
            <input type="file" ref={fileInput} className='hidden' onChange={hdlImageChange} name='profile-image' accept='.png, .jpg, .jpeg, .svg, .webp '/>
          </div>
          <div className='flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center'>
            <div className='w-full'>
              <Input placeholder="Email" type="email" value={userInfo.email} disabled className="rounded-lg p-6 bg-[#2c2e3b] border-none" />
            </div>
            <div className='w-full'>
              <Input placeholder="First Name" type="text" value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none" />
            </div>
            <div className='w-full'>
              <Input placeholder="Last Name" type="text" value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none" />
            </div>
            <div className='w-full flex gap-5'>
              {
                colors.map((item, index) => (
                  <div className={`${item} h-8 w-8 rounded-full cursor-pointer transition-all duration-300
                ${selectedColor === index 
                  ?"outline outline-white/80 outline-1" 
                    : ""}
                `}
                key={index}
                onClick={()=> setSelectedColor(index)}
                ></div>)
              )}
            </div>
          </div>
        </div>
        <div className='w-full'>
          <Button className="h-18 w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
          onClick={saveChange}
          >
            Save Change
          </Button>
        </div>
      </div>
    </div>
  )
}



export default Profile