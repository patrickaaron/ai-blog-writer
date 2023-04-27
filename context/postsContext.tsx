import { useRouter } from "next/router";
import React, { useCallback, useContext, useReducer, useState } from "react";
import { PostType } from "@/types/types";

type GetPostOptions = {
  lastPostDate: string;
  getNewerPosts?: boolean;
};

type PostsContextInterface = {
  posts: PostType[];
  setPostsFromSSR: (postsFromSSR: PostType[]) => void;
  getPosts: ({ lastPostDate, getNewerPosts }: GetPostOptions) => Promise<void>;
  // noMorePosts: boolean;
  deletePost: (postId: string) => void;
};

const PostsContext = React.createContext<PostsContextInterface>(
  {} as PostsContextInterface
);

type PostState = PostType[];
type Action =
  | { type: "addPosts"; posts: PostType[] }
  | { type: "deletePost"; postId: string };

function postsReducer(state: PostState, action: Action) {
  switch (action.type) {
    case "addPosts": {
      return [...action.posts];
    }
    case "deletePost": {
      const newPosts = state.filter((post) => post._id !== action.postId);
      return newPosts;
    }
    default:
      return state;
  }
}

export const PostsProvider = ({ children }: { children: React.ReactNode }) => {
  const [posts, dispatch] = useReducer(postsReducer, []);
  // const [noMorePosts, setNoMorePosts] = useState(false);

  const deletePost = useCallback((postId: string) => {
    dispatch({
      type: "deletePost",
      postId,
    });
  }, []);

  const setPostsFromSSR = useCallback((postsFromSSR: PostType[] = []) => {
    dispatch({ type: "addPosts", posts: postsFromSSR });
  }, []);

  const getPosts = useCallback(
    async ({ lastPostDate, getNewerPosts = false }: GetPostOptions) => {
      const result = await fetch("/api/getPosts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ lastPostDate, getNewerPosts }),
      });

      const json = (await result.json()) as { posts: PostType[] };
      const postsResult = json.posts || [];

      dispatch({ type: "addPosts", posts: postsResult });
    },
    []
  );

  return (
    <PostsContext.Provider
      value={{ posts, setPostsFromSSR, getPosts, deletePost }}
    >
      {children}
    </PostsContext.Provider>
  );
};

export const usePostsContext = () => useContext(PostsContext);
