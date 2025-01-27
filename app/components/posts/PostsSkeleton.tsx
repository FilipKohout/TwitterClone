import React from "react"
import ContentLoader from "react-content-loader"

const Skeleton = (props: any) => (
    <div className="frame flex flex-col gap-3 w-main">
        <ContentLoader
            speed={2}
            width="100%"
            height={96}
            viewBox="0 0 100% 96"
            backgroundColor="#9c9c9c"
            foregroundColor="#ffffff"
            {...props}
        >
            <rect x="48" y="8" rx="3" ry="3" width="88" height="6"/>
            <rect x="48" y="26" rx="3" ry="3" width="52" height="6"/>
            <rect x="0" y="56" rx="3" ry="3" width="410" height="6"/>
            <rect x="0" y="72" rx="3" ry="3" width="380" height="6"/>
            <rect x="0" y="88" rx="3" ry="3" width="178" height="6"/>
            <circle cx="20" cy="20" r="20"/>
        </ContentLoader>
    </div>

);

const PostsSkeleton = (props: { posts: number }) => {
    const skeletons = Array.from({ length: props.posts }, (_, i) => <Skeleton key={i} />);

    return skeletons
}

export default PostsSkeleton;
