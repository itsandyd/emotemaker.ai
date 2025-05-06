"use client"


import { useEffect, useState } from "react";
import { checkSubscription } from "../lib/subscription";


import { useUser } from '@clerk/nextjs'
import { useProModal } from "../hooks/use-pro-modal";
import { getUser } from "../actions/get-user";
import Landing from "../components/Landing";
  import {Footer }from "../components/Footer";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [isPro, setIsPro] = useState(false);
  const router = useRouter();
  const proModal = useProModal();
  const { user } = useUser();

  useEffect(() => {
    const initUser = async () => {
      if (user) {
        try {
          const name = user.firstName || 'Default Name';
          const email = user.primaryEmailAddress?.emailAddress || 'default@example.com';
          await getUser({ userId: user.id, name, email });
        } catch (error) {
          console.error("Failed to initialize user:", error);
        }
      }
    };
  
    initUser();
  }, [user]);

  useEffect(() => {
    const fetchIsPro = async () => {
      const proStatus = await checkSubscription();
      setIsPro(proStatus);
    };

    fetchIsPro();
  }, []);

  const handleStartCreating = () => {
    if (isPro) {
      router.push('/emotes');
    } else {
      // proModal.onOpen();
      router.push('/emotes');
    }
  };

  return (
//     <section className="w-full py-12 bg-white dark:bg-[#222]">
      
//       <div className="container mx-auto px-4 md:px-24">
//         <div className="flex flex-col items-center space-y-4 text-center">
//           <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-gray-800 dark:text-white pb-6">
//             🎮 Unleash Your Creativity with EmoteMaker.ai! 🚀
//           </h1>
//           <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl dark:text-gray-300">
//             Attention Twitch streamers and Discord admins! <br />Get ready to revolutionize your emote game with EmoteMaker.ai, the ultimate AI-powered tool for crafting epic emotes that will captivate your audience and elevate your server to new heights. 🤖✨
//           </p>

//           <Button onClick={handleStartCreating} variant="default" className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 py-2 mt-4 text-sm font-medium text-white shadow-lg transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
//         Start Creating Now
//         <Zap className="w-4 h-4 ml-2 fill-white" />
//       </Button>
//         </div>

//         <div className="flex flex-col items-center space-y-4 text-center">
//         <h2 className="text-2xl font-bold tracking-tighter sm:text-4xl  text-gray-800 dark:text-white pb-6 px-24 py-12">
//         🌟 Emote Styles for Every Occasion 🎨
//           </h2>
//       <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 px-6 py-4">

//       <Card className="border shadow-sm rounded-lg">
//         <CardHeader className="pb-2">
//           <CardTitle className="font-semibold text-lg">Pixel Emotes</CardTitle>
//         </CardHeader>
//         <CardContent className="flex justify-between items-center">
//           <Avatar className="w-16 h-16">
//             <AvatarImage alt="Happy Emote" src="/ashootingstar.png" />
//             <AvatarFallback>PE</AvatarFallback>
//           </Avatar>
//           <Button className="ml-2" variant="outline">
//             <Link href="/pixels">Use</Link>
//           </Button>
//         </CardContent>
//       </Card>
//       <Card className="border shadow-sm rounded-lg">
//         <CardHeader className="pb-2">
//           <CardTitle className="font-semibold text-lg">Kawaii Emotes</CardTitle>
//         </CardHeader>
//         <CardContent className="flex justify-between items-center">
//           <Avatar className="w-16 h-16">
//             <AvatarImage alt="Sad Emote" src="/kawaiiboy.png" />
//             <AvatarFallback>KE</AvatarFallback>
//           </Avatar>
//           <Button className="ml-2" variant="outline">
//             <Link href="/kawaii">Use</Link>
//           </Button>
//         </CardContent>
//       </Card>
//       <Card className="border shadow-sm rounded-lg">
//         <CardHeader className="pb-2">
//           <CardTitle className="font-semibold text-lg">Object Emotes</CardTitle>
//         </CardHeader>
//         <CardContent className="flex justify-between items-center">
//           <Avatar className="w-16 h-16">
//             <AvatarImage alt="Angry Emote" src="/hamsandwich.png" />
//             <AvatarFallback>OE</AvatarFallback>
//           </Avatar>
//           <Button className="ml-2" variant="outline">
//             <Link href="/objects">Use</Link>
//           </Button>
//         </CardContent>
//       </Card>
//       <Card className="border shadow-sm rounded-lg">
//         <CardHeader className="pb-2">
//           <CardTitle className="font-semibold text-lg">Cute Bold Line Emotes</CardTitle>
//         </CardHeader>
//         <CardContent className="flex justify-between items-center">
//           <Avatar className="w-16 h-16">
//             <AvatarImage alt="Laughing Emote" src="/cbl.png?height=64&width=64" />
//             <AvatarFallback>CBL</AvatarFallback>
//           </Avatar>
//           <Button className="ml-2" variant="outline">
//             <Link href="/cuteboldlines">Use</Link>
//           </Button>
//         </CardContent>
//       </Card>
//       <Card className="border shadow-sm rounded-lg">
//         <CardHeader className="pb-2">
//           <CardTitle className="font-semibold text-lg">Text Based Emotes</CardTitle>
//         </CardHeader>
//         <CardContent className="flex justify-between items-center">
//           <Avatar className="w-16 h-16">
//             <AvatarImage alt="BOZO!" src="/textbased.png" />
//             <AvatarFallback>TB</AvatarFallback>
//           </Avatar>
//           <Button className="ml-2" variant="outline">
//             <Link href="/textbased">Use</Link>
//           </Button>
//         </CardContent>
//       </Card>
//       <Card className="border shadow-sm rounded-lg">
//         <CardHeader className="pb-2">
//           <CardTitle className="font-semibold text-lg">3D Based Emotes</CardTitle>
//         </CardHeader>
//         <CardContent className="flex justify-between items-center">
//           <Avatar className="w-16 h-16">
//             <AvatarImage alt="Laughing Emote" src="/3dbasketball.png" />
//             <AvatarFallback>3D</AvatarFallback>
//           </Avatar>
//           <Button className="ml-2" variant="outline">
//             <Link href="/3d">Use</Link>
//           </Button>
//         </CardContent>
//       </Card>
//       <Card className="border shadow-sm rounded-lg">
//         <CardHeader className="pb-2">
//           <CardTitle className="font-semibold text-lg">Pepe Based Emotes</CardTitle>
//         </CardHeader>
//         <CardContent className="flex justify-between items-center">
//           <Avatar className="w-16 h-16">
//             <AvatarImage alt="Laughing Emote" src="/placeholder.svg?height=64&width=64" />
//             <AvatarFallback>PF</AvatarFallback>
//           </Avatar>
//           <Button className="ml-2" variant="outline">
//             <Link href="/pepethefrog">Use</Link>
//           </Button>
//         </CardContent>
//       </Card>
//       <Card className="border shadow-sm rounded-lg">
//         <CardHeader className="pb-2">
//           <CardTitle className="font-semibold text-lg">Sticker Based Emotes</CardTitle>
//         </CardHeader>
//         <CardContent className="flex justify-between items-center">
//           <Avatar className="w-16 h-16">
//             <AvatarImage alt="Laughing Emote" src="/turtlesticker.png" />
//             <AvatarFallback>S</AvatarFallback>
//           </Avatar>
//           <Button className="ml-2" variant="outline">
//             <Link href="/stickers">Use</Link>
//           </Button>
//         </CardContent>
//       </Card>
//       <Card className="border shadow-sm rounded-lg">
//         <CardHeader className="pb-2">
//           <CardTitle className="font-semibold text-lg">Chibi Emotes</CardTitle>
//         </CardHeader>
//         <CardContent className="flex justify-between items-center">
//           <Avatar className="w-16 h-16">
//             <AvatarImage alt="Chibi Emote" src="/chibi1.png" />
//             <AvatarFallback>S</AvatarFallback>
//           </Avatar>
//           <Button className="ml-2" variant="outline">
//             <Link href="/chibi">Use</Link>
//           </Button>
//         </CardContent>
//       </Card>
//       <Card className="border shadow-sm rounded-lg">
//         <CardHeader className="pb-2">
//           <CardTitle className="font-semibold text-lg">Meme Emotes</CardTitle>
//         </CardHeader>
//         <CardContent className="flex justify-between items-center">
//           <Avatar className="w-16 h-16">
//             <AvatarImage alt="Meme Emote" src="/meme.png" />
//             <AvatarFallback>S</AvatarFallback>
//           </Avatar>
//           <Button className="ml-2" variant="outline">
//             <Link href="/meme">Use</Link>
//           </Button>
//         </CardContent>
//       </Card>
//       {/* <Card className="border shadow-sm rounded-lg">
//         <CardHeader className="pb-2">
//           <CardTitle className="font-semibold text-lg">Text Based Emotes</CardTitle>
//         </CardHeader>
//         <CardContent className="flex justify-between items-center">
//           <Avatar className="w-16 h-16">
//             <AvatarImage alt="Laughing Emote" src="/placeholder.svg?height=64&width=64" />
//             <AvatarFallback>T</AvatarFallback>
//           </Avatar>
//           <Button className="ml-2" variant="outline">
//             <Link href="/textbased">Use</Link>
//           </Button>
//         </CardContent>
//       </Card> */}
//     </div>
//     </div>



//     <div className="flex flex-col items-center space-y-4 text-center">
//     <h2 className="text-2xl font-bold tracking-tighter sm:text-4xl  text-gray-800 dark:text-white pb-6 px-24 py-12">
//     🚀 One-Click Background Removal 🎉
//           </h2>
//           <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl dark:text-gray-300">
//           That&apos;s right - you can now remove the background from any emoji or image generated on EmoteMaker.ai with a single click! No more fiddling with complex editing tools. Just generate your emoji and click the new &quot;Remove Background&quot; button. Voila - you&apos;ll have a perfectly cropped emoji ready to use anywhere.
//           </p>

//           {/* <h3 className="text-xl font-bold tracking-tighter text-gray-800 dark:text-white pb-6 px-24 py-12">
//           🌟 Unleash the Power of Transparent Emojis
//           </h3> */}

//           {/* <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl dark:text-gray-300">
//           With our one-click background removal, you can:
//           <div className="text-sm">
// <li>Instantly remove backgrounds and transparently overlay your emojis on any image</li>
// <li>Create professional-looking emoji sets with transparent backgrounds for your streams, servers, and projects</li>
// <li>Save tons of time and hassle compared to manually editing out backgrounds</li>
// We can&apos;t wait for you to try out one-click background removal and see how much easier and faster it makes your emoji creation workflow.
// </div>
//           </p> */}

//           <Button onClick={handleStartCreating} variant="default" className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 py-2 mt-4 text-sm font-medium text-white shadow-lg transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
//           Try One-Click Background Removal Now
//         <Zap className="w-4 h-4 ml-2 fill-white" />
//       </Button>
//         </div>



//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
//         <div className="flex flex-col items-center p-6 bg-white rounded-lg">
//   <h2 className="text-2xl font-bold text-gray-800 dark:text-white">For Gamers and Streamers 🌟🎨</h2>
//   <p className="mt-2 text-gray-600 dark:text-gray-300">Transform your wildest ideas into pixel-perfect emotes at the click of a button. Whether you&apos;re a Twitch hero, a Discord master, or just looking to amp up your digital presence, EmoteMaker.ai is your ultimate ally.</p>
//   <div className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300">
//   <p className="font-bold">🌪️ Instant Creation Magic:</p><p> Type your vision, and watch as AI brings it to life in seconds.</p>
//   <p className="font-bold">🖌️ Unleash Your Creativity:</p><p>Make emotes that truly vibe with your unique style.</p>
//   <p className="font-bold">🤖 AI Precision at Its Finest:</p><p> Expect crisp, professional-quality emotes every time.</p>
//   <p className="font-bold">🕹️ Easy and Accessible:</p><p> User-friendly for all, from gaming newbies to esports legends.</p>
//   <p className="font-bold">🌐 Perfect for All Platforms:</p><p> Rule Twitch, Discord, and the entire digital realm with your custom emotes!</p>
//   </div>

//   <Button onClick={handleStartCreating} variant="default" className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 py-2 mt-4 text-sm font-medium text-white shadow-lg transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
//         Start Creating
//         <Zap className="w-4 h-4 ml-2 fill-white" />
//       </Button>

// </div>
// <div className="flex flex-col items-center p-6 bg-white rounded-lg">
//   <h2 className="text-2xl font-bold text-gray-800 dark:text-white">For Artists 🎨🖌️</h2>
//   <p className="mt-2 text-gray-600 dark:text-gray-300">EmoteMaker.ai isn&apost just for gamers and streamers. Artists can also leverage the power of our AI to generate emotes for clients in less time. Spend less time on the tedious parts of design and more time on what you love - being creative!</p>
//   <div className="list-disc list-inside mt-2 text-gray-600 dark:text-gray-300">
//     <p className="font-bold">🚀 Speed Up Your Workflow: </p>
//     <p>Generate emote drafts in seconds, giving you more time to refine and perfect your designs.</p>
//     <p className="font-bold">🎯 Meet Client Needs:</p><p>Quickly create a variety of emotes based on client specifications.</p>
//     <p className="font-bold">🔄 Iterate Faster:</p><p>Use the AI-generated emotes as a starting point and iterate on them to create the final product.</p>
//   </div>

//   <Button onClick={handleStartCreating} variant="default" className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 py-2 mt-4 text-sm font-medium text-white shadow-lg transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
//         Start Creating
//         <Zap className="w-4 h-4 ml-2 fill-white" />
//       </Button>

// </div>
// </div>
// {/* <EmoteShowcase /> */}
//       </div>
//     </section>



<section>
  <Landing />
  <Footer />
  </section>
  )
}