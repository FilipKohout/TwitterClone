import React from "react"
import ContentLoader from "react-content-loader"

const Skeleton = (props: { users?: number }) => (
    <div className="bgframe flex flex-col gap-3 w-full">
        <ContentLoader
            speed={2}
            width="100%"
            height={40}
            viewBox="0 0 100% 40"
            backgroundColor="#9c9c9c"
            foregroundColor="#ffffff"
            {...props}
        >
            <rect x="48" y="8" rx="3" ry="3" width="88" height="6"/>
            <rect x="48" y="26" rx="3" ry="3" width="52" height="6"/>
            <circle cx="20" cy="20" r="20"/>
        </ContentLoader>
    </div>

);

const PostsSkeleton = (props: { users: number }) => {
    const skeletons = Array.from({ length: props.users }, (_, i) => <Skeleton key={i} />);

    return skeletons
}

export default PostsSkeleton;
