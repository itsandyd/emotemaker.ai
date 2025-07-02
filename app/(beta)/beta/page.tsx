import EmojiMaker from "../_components/EmojiMaker";



export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">CustomEmoji Maker</h1>
      <EmojiMaker />
      <div className="mt-8 text-center">
        {/* <FeedbackForm /> */}
      </div>
    </main>
  )
}