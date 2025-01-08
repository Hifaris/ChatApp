import apiClient from "@/lib/api-client";
import { useAppStore } from "@/store";
import { GET_MESSAGE_ROUTE, HOST } from "@/utils/constants";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { MdFolderZip, MdDownload } from "react-icons/md"
// import {IoMdArrowRoundDown} from "react-icons/io5"

const MessageContainer = () => {
  const scrollRef = useRef();
  const { selectedChatType, selectedChatData, selectedChatMessages, setSelectedChatMessages,setIsDownloading,setFileDownloadProgress} = useAppStore();

  const [showImg, setShowImg] = useState(false)
  const [imgUrl, setImgUrl] = useState(null)

  useEffect(() => {

    const getMessage = async () => {
      try {
        const resp = await apiClient.post(GET_MESSAGE_ROUTE, { id: selectedChatData._id }, { withCredentials: true })
        if (resp.data.messages) {
          setSelectedChatMessages(resp.data.messages)
        }
      } catch (error) {
        console.log(error)
      }
    }

    if (selectedChatData._id) {
      if (selectedChatType === "contact") getMessage()
    }

  }, [selectedChatType, selectedChatData, setSelectedChatMessages])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChatMessages]);

  const checkImage = (filePath) => {
    const imageRegex =
      /\.(jpg|jpeg|png|gif|bmp|tiff|webp|svg|ico|heic|heif)$/i
    return imageRegex.test(filePath)
  }

  const renderMessage = () => {
    // Add null check and provide default empty array
    if (!selectedChatMessages || !Array.isArray(selectedChatMessages)) {
      return null;
    }

    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      //IF messageDat not equal lastDate it mean chat is the new date that mean if showData = true it not the same day
      lastDate = messageDate;

      return (
        <div key={message._id || index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contact" && renderDMMessage(message)}
        </div>
      );
    });
  };

  const downloadFile = async (url) => {
    setIsDownloading(true)
    setFileDownloadProgress(0)
    const resp = await apiClient.get(`${HOST}/${url}`, {
      responseType: "blob",
      onDownloadProgress:(progressEvent)=>{
        const {loaded,total}=progressEvent
        const percentCompleted = Math.round((loaded*100)/total)
        setFileDownloadProgress(percentCompleted)
      }
    })
    const urlBlob = window.URL.createObjectURL(new Blob([resp.data]))
    const link = document.createElement("a")
    link.href = urlBlob
    link.setAttribute("download", url.split("/").pop())
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(urlBlob)
    setIsDownloading(false)
    setFileDownloadProgress(0)
  }

  const renderDMMessage = (message) => (
    <div
      className={`${message.sender === selectedChatData._id
        ? "text-left"
        : "text-right"
        } mb-4`}
    >
      {message.messageType === "text" && (
        <div
          className={`${message.sender !== selectedChatData._id
            ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
            : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } rounded border inline-block p-4 my-1 max-w-[50%] break-words`}
        >
          {message.content}
        </div>
      )}
      {
        message.messageType === "file" && (
          <div
            className={`${message.sender !== selectedChatData._id
              ? "bg-[#8417ff]/5 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
              } rounded border inline-block p-4 my-1 max-w-[50%] break-words`}
          >
            {checkImage(message.fileUrl)
              ? <div className="cursor-pointer" onClick={() => {
                setShowImg(true);
                setImgUrl(message.fileUrl)
              }}><img src={`${HOST}/${message.fileUrl}`} width={300} height={300} /></div>
              : <div className="flex items-center justify-center gap-4">
                <span className="text-white/8 text-3xl bg-black/20 rounded-full p-3 cursor-pointer">
                  <MdFolderZip />
                </span>
                <span>{message.fileUrl.split("/").pop()}</span>
                <span className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300" onClick={() => downloadFile(message.fileUrl)}>
                  <MdDownload />
                </span>
              </div>
            }
          </div>
        )
      }
      <div className="text-xs text-gray-600">
        {moment(message.timestamp).format("LT")}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
      {renderMessage()}
      <div ref={scrollRef} />
      {showImg && <div className="fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg flex-col">
        <div>
          <img src={`${HOST}/${imgUrl}`} className="h-[80vh] w-full bg-cover" />
        </div>
        <div className="flex gap-5 fixed top-0 mt-5">
          <button className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300" onClick={()=>downloadFile(imgUrl)} >
          <MdDownload />
          </button>
          <button className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300"
           onClick={()=>{
            setShowImg(false);
            setImgUrl(null)
            }} >
          <IoCloseSharp />
          </button>
        </div>
      </div>

      }
    </div>
  );
};

export default MessageContainer;