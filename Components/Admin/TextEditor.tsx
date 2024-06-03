import React, { useEffect, useRef, useState } from "react";
import { AtomicBlockUtils, EditorState, convertToRaw, ContentBlock } from "draft-js";

import {
  Editor,
  addImage, // Import this utility
  createDecorator, // Import this utility
  findEntitiesOf, // Import this utility
  isBold,
  toggleBold,
} from "contenido";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import Image from "./ImageContainer";
import { Image_Svg } from "../SVGS";

interface Props {
  editorState: EditorState;
  setEditorState: React.Dispatch<React.SetStateAction<EditorState>>;
}

export default function TextEditor({ editorState, setEditorState }: Props) {
  const imageInputRef = useRef(null);
  const [image, setImage] = useState<File>();

  const insertImage = (editorState: any, base64: string) => {
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      "image",
      "IMMUTABLE",
      { src: base64 }
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    });
    return AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " ");
  };

  useEffect(() => {
    console.log(
      editorState.getCurrentContent().toObject()
    );

  }, [editorState]);

  useEffect(() => {
    const reader = new FileReader();

    reader.onloadend = (res) => {
      // addImage(editorState, setEditorState, {
      //   src: res.target?.result as string,
      //   alt: image?.name,
      //   style: {
      //     width: 400,
      //     height: "auto",
      //   },
      // });

      setEditorState(insertImage(editorState, res.target?.result as string));
    };

    if (image) {
      (async () => {
        await reader.readAsDataURL(image);
      })();
    }
  }, [image]);

  return (
    <div className="flex flex-col gap-2 ">
      <header className="flex flex-row items-center gap-3 px-2">
        <button
          className=""
          onClick={() => {
            // @ts-ignore
            imageInputRef.current?.click();
          }}
        >
          <input
            onChange={(e) => {
              e?.target?.files?.length ? setImage(e.target.files[0]) : null;
            }}
            type="file"
            hidden
            ref={imageInputRef}
          />
          <Image_Svg classname="w-5 h-auto fill-lightBlack" />
        </button>
        <button
          className={`${
            isBold(editorState) ? " text-green1" : "text-lightBlack border-none"
          }   w-5 h-5 font-[500] pt-[3px] flex items-center justify-center`}
          onClick={() => {
            toggleBold(editorState, setEditorState);
          }}
        >
          <span className="text-center h-fit text-[22px]">B</span>
        </button>
      </header>
      <div className="w-full [&>div]:w-full border rounded-lg [&>div]:h-fit [&>div]:p-4 [&_img]:w-full">
        <Editor editorState={editorState} onChange={setEditorState} />
      </div>
    </div>
  );
}
