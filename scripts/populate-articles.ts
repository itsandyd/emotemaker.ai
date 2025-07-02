const { db } = require("../lib/db");
const { v4: uuidv4 } = require('uuid');

const articles = [
  { title: "How to create your first emote", category: "Getting Started" },
  { title: "Understanding AI-powered emote generation", category: "Getting Started" },
  { title: "Advanced techniques for emote customization", category: "Tutorials" },
  { title: "Troubleshooting common issues", category: "FAQs" },
  { title: "Best practices for emote design", category: "Tutorials" },
  { title: "How to join our Discord community", category: "Community" },
];

async function main() {
  for (const article of articles) {
    await db.article.create({
      data: {
        title: article.title,
        content: "This is a placeholder content for " + article.title,
        category: article.category,
        slug: article.title.toLowerCase().replace(/ /g, '-') + '-' + uuidv4().slice(0, 8),
        author: "EmoteMaker Team",
        publishedAt: new Date(),
      },
    });
  }

  console.log('Articles have been populated!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });