import styles from "@/app/styles/modals.module.css";
import UserProfileList from "@/app/components/users/UserProfileList";
import { UsersFilter } from "@/app/actions/users";

export default function UserListProfileModal({ closeFunction, title, source, userId }: { closeFunction?: () => void, title: string, source: UsersFilter, userId: number }) {
    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>{title}</h1>
            <div className={styles.form}>
                <div className="max-h-96 overflow-auto">
                    <UserProfileList source={source} userId={userId} />
                </div>
                <button className="negativeButton" onClick={closeFunction}>Close</button>
            </div>
        </div>
    );
}