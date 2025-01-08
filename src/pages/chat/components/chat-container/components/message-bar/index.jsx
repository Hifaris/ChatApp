import { useSocket } from "@/context/SocketContext"
import apiClient from "@/lib/api-client"
import { useAppStore } from "@/store"
import { UPLOAD_FILE_ROUTE } from "@/utils/constants"
import EmojiPicker from "emoji-picker-react"
import { useEffect, useRef, useState } from "react"
import { GrAttachment } from 'react-icons/gr'
import { IoSend } from "react-icons/io5"
import { RiEmojiStickerLine } from "react-icons/ri"

const MessageBar = () => {

    const emojiRef = useRef()
    const fileInputRef = useRef()
    const socket = useSocket()
    const {selectedChatType,selectedChatData,userInfo,setIsUploading,setFileUploadProgress} = useAppStore()
    const [message, setMessage] = useState("")
    const [emojiPickerOpen,setEmojiPickerOpen] = useState(false)
    
    useEffect(()=>{
       function hdlClickOutsideEmoji(e){
        if(emojiRef.current && !emojiRef.current.contains(e.target)){
            setEmojiPickerOpen(false)
        }
       }
       document.addEventListener("mousedown",hdlClickOutsideEmoji)
       return ()=>{
        document.removeEventListener("mousedown",hdlClickOutsideEmoji)
       }
    },[emojiRef])
    
    const hdlEmoji =(emoji)=>{
    setMessage((msg)=> msg + emoji.emoji)
    }

    const hdlSendMessage = async() => {
       if(selectedChatType === "contact"){
        socket.emit("sendMessage",{
            sender: userInfo.id,
            content:message,
            recipient:selectedChatData._id,
            messageType:"text",
            fileUrl:undefined
        })
       }
       setMessage("")
    }

    const hdlAttachmentClick=()=>{
        if(fileInputRef.current){
            fileInputRef.current.click()
        }
    }

    const hdlAttachmentChange=async(e)=>{
        try {
            const file = e.target.files[0]
            // console.log(file)
            if(file){
                const formData = new FormData()
                formData.append("file",file)
                setIsUploading(true)

                const resp = await apiClient.post(UPLOAD_FILE_ROUTE,formData,{withCredentials:true})

                if(resp.status === 200 || resp.data){
                    setIsUploading(false)
                  if(selectedChatType === "contact"){
                    socket.emit("sendMessage",{
                        sender: userInfo.id,
                        content:undefined,
                        recipient:selectedChatData._id,
                        messageType:"file",
                        fileUrl:resp.data.filePath
                    })
                  }
                }
            }

        } catch (error) {
            setIsUploading(false)
            console.log(error)
        }
    }
    return (
        <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6">
            <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
                <input type="text" className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none"
                    placeholder="Enter Message" value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all" onClick={(hdlAttachmentClick)}>
                    <GrAttachment className="text-2xl" />
                </button>
                <input type="file" className="hidden" ref={fileInputRef} onChange={hdlAttachmentChange} />
                <div className="relative">
                    <button className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                    onClick={()=> setEmojiPickerOpen(true)}
                    >
                        <RiEmojiStickerLine className="text-2xl" />
                    </button>
                    <div className="absolute bottom-16 right-0" ref={emojiRef}>
                        <EmojiPicker theme="dark" 
                        open={emojiPickerOpen}
                        onEmojiClick={hdlEmoji}
                        autoFocusSearch={false}
                        />
                    </div>
                </div>
            </div>
            <button className="bg-[#8417ff] rounded-md flex items-center justify-center p-5 hover:bg-[#741bda] focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                onClick={hdlSendMessage}
            >
                <IoSend className="text-2xl" />
            </button>
        </div>
    )
}
export default MessageBar