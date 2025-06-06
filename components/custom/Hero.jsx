'use client';
import { MessagesContext } from '../../context/MessagesContext';
import { UserDetailContext } from '../../context/UserDetailContext';
import Colors from '../../data/Colors';
import Lookup from '../../data/Lookup';
import { ArrowRight, Link } from 'lucide-react';
import React, { useContext, useState } from 'react';
import SignInDialog from './SignInDialog';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Github } from 'lucide-react';

function Hero() {
  const [userInput, setUserInput] = useState();
  const { messages, setMessages } = useContext(MessagesContext);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [openDialog, setOpenDialog] = useState(false);
  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);
  const router = useRouter();

  const onGenerate = async (input) => {
    if (!userDetail?.name) {
      setOpenDialog(true);
      return;
    }
    if (!userDetail?._id) {
      toast.error('User information is missing');
      return;
    }
    if (userDetail?.token < 10) {
      toast("You don't have enough token to generate code");
      return;
    }
    if (!input?.trim()) return;

    try {
      const msg = {
        role: 'user',
        content: input.trim(),
        id: crypto.randomUUID()
      };

      // Initialize messages as array
      setMessages([msg]);

      const workspaceId = await CreateWorkspace({
        user: userDetail._id,
        messages: [msg],
      });

      if (!workspaceId) {
        throw new Error('Failed to create workspace');
      }

      console.log('Created workspace:', workspaceId);
      router.push('/workspace/' + workspaceId);
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error(error.message || 'Failed to create chat');
      setMessages([]); // Reset messages on error
    }
  };

  return (
    <div className="flex flex-col items-center mt-30 xl:mt-42 gap-2">
      <span className='flex items-center text-blue-500 font-bold text-sm rounded-full px-2 py-1 mb-20 bg-blue-500/10'><Github className='h-4' /> Intelligent Code Generation</span>
      <h2 className="font-bold text-4xl">{Lookup.HERO_HEADING}</h2>
      <p className="text-gray-400 font-medium">{Lookup.HERO_DESC}</p>
      <div
        className="p-5 border rounded-xl max-w-2xl w-full mt-3"
        style={{
          backgroundColor: Colors.BACKGROUND,
        }}
      >
        <div className="flex gap-2">
          <textarea
            placeholder={Lookup.INPUT_PLACEHOLDER}
            className="outline-none bg-transparent w-full h-28 max-h-50 resize-none"
            onChange={(event) => setUserInput(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (userInput) {
                  onGenerate(userInput);
                }
              }
            }}
          />
          {userInput && (
            <ArrowRight
              onClick={() => onGenerate(userInput)}
              className="bg-blue-500 p-2 w-10 h-10 rounded-md cursor-pointer"
            />
          )}
        </div>
       
        <div>
          <Link className="h-5 w-5" />
        </div>
      </div>

      <div className="flex mt-8 flex-wrap max-w-2xl items-center justify-center gap-3">
        {Lookup.SUGGSTIONS.map((suggestion, index) => (
          <h2
            className="p-1 px-2 border rounded-full text-sm text-gray-400 hover:text-white cursor-pointer"
            key={index}
            onClick={() => onGenerate(suggestion)}
          >
            {suggestion}
          </h2>
        ))}
      </div>

      <SignInDialog
        openDialog={openDialog}
        closeDialog={(v) => setOpenDialog(v)}
      />
    </div>
  );
}

export default Hero;
