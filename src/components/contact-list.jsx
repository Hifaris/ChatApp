import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "./ui/avatar";
import { HOST } from "@/utils/constants";
import { getColor } from "@/lib/utils";

function ContactList({ contacts, isChannel = false }) {
    const {
        selectedChatType,
        selectedChatData,
        setSelectedChatType,
        setSelectedChatData,
        setSelectedChatMessages
    } = useAppStore();

    const hdlClick = (contacts) => {
        if (isChannel) setSelectedChatType("channel")
        else setSelectedChatType("contact")
        setSelectedChatData(contacts)
        if (selectedChatData && selectedChatData._id !== contacts._id) {
            setSelectedChatMessages([])
        }
    }
    return (
        <div className="mt-5">
            {
                contacts.map((contacts) => (
                    <div key={contacts._id} className={`pl-10 py-2 transition-all duration-300 cursor-pointer
                        ${selectedChatData && (selectedChatData._id === contacts._id)
                            ? "bg-[#8417ff] hover:bg-[#8417ff]"
                            : "hover:bg-[#f1f1f111]"
                        }
                        `} onClick={() => hdlClick(contacts)}>
                        <div className="flex gap-5 items-center justify-start text-neutral-300">
                            {
                                !isChannel && <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                                    {
                                        contacts.image ? (<AvatarImage src={`${HOST}/${contacts.image}`} alt="profile" className="object-cover w-full h-full bg-black" />)
                                            : (
                                                <div className={`
                                                ${selectedChatData && selectedChatData._id === contacts._id
                                                        ? "bg-[#ffffff22] border border-white/70"
                                                        : getColor(contacts.color)}
                                                uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full`}>
                                                    {contacts.firstName ? contacts.firstName.split("").shift() : contacts.email.split("").shift()}
                                                </div>
                                            )}
                                </Avatar>
                            }
                            {
                                isChannel && <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">#</div>
                            }
                            {isChannel ? <span>{contacts.name}</span> : contacts.firstName ?<span>{`${contacts.firstName} ${contacts.lastName}`}</span> : <span>{contacts.email.split("@")[0]}</span>}
                        </div>
                    </div>
                ))
            }
        </div>
    )
}
export default ContactList