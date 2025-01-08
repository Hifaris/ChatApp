import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"
import { FaPlus } from "react-icons/fa"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { animationDefault, getColor } from "@/lib/utils"
import Lottie from "react-lottie"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import apiClient from "@/lib/api-client"
import { HOST, SEARCH_CONTACT_ROUTE } from "@/utils/constants"
import { useAppStore } from "@/store"

const NewDm = () => {
    
    const { setSelectedChatType, setSelectedChatData } = useAppStore();
    const [openNewContactModal, setOpenNewContactModal] = useState(false)
    const [searchedContact, setSearchedContact] = useState([])

    const searchContact = async (searchTerm) => {
        //  console.log(e)
        try {
            if (searchTerm.length > 0) {
                const resp = await apiClient.post(
                    SEARCH_CONTACT_ROUTE,
                    { searchTerm },
                    { withCredentials: true }
                )
                if (resp.status === 200 && resp.data.contacts) {
                    setSearchedContact(resp.data.contacts)
                }
            } else {
                setSearchedContact([])
            }
        } catch (error) {
            console.log(error)
        }
    }

    const selectNewContact =(contact)=>{
       setOpenNewContactModal(false)
       setSelectedChatType("contact")
       setSelectedChatData(contact)
       setSearchedContact([])
    }
    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <FaPlus className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
                            onClick={() => setOpenNewContactModal(true)}
                        />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
                        Select New Contact
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal}>
                <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Please select a contact</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <div>
                        <Input
                            placeholder="Search Contact"
                            className="rounded-lg p-6 bg-[#2c2e3b] border-none"
                            onChange={e => searchContact(e.target.value)}
                        />
                    </div>

                    {
                        searchedContact.length <= 0 ? <div className="flex-1 md:flex flex-col justify-center mt-5 duration-1000 transition-none items-center">
                            <Lottie
                                isClickToPauseDisabled={true}
                                height={100}
                                width={100}
                                options={animationDefault}
                            />
                            <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-5 lg:text-2xl text-xl transition-all duration-300 text-center lg:p-1">
                                <h3 className="poppins-medium">
                                    Hi <span className="text-purple-500">! </span>
                                    Search new<span className="text-purple-500"> Contact. </span>

                                </h3>
                            </div>
                        </div>
                            : <ScrollArea className="h-[250px]">
                                <div className="flex flex-col gap-5">
                                    {
                                        searchedContact.map((item) => (
                                            <div key={item.id} className="flex gap-3 items-center cursor-pointer" onClick={()=>selectNewContact(item)}>
                                                <div className="w-12 h-12 relative">
                                                    <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                                                        {
                                                            item.image ? (<AvatarImage src={`${HOST}/${item.image}`} alt="profile" className="object-cover w-full h-full bg-black" />)
                                                                : (
                                                                    <div className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(item.color)}`}>
                                                                        {item.firstName ? item.firstName.split("").shift() : item.email.split("").shift()}
                                                                    </div>
                                                                )}
                                                    </Avatar>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span>
                                                        {
                                                            item.firstName && item.lastName ? `${item.firstName} ${item.lastName}` : item.email
                                                        }
                                                    </span>
                                                    <span className="text-xs">{item.email}</span>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </ScrollArea>
                    }
                </DialogContent>
            </Dialog>


        </>
    )
}
export default NewDm