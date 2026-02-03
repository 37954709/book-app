import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // タグの作成
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: '小説' },
      update: {},
      create: { name: '小説' },
    }),
    prisma.tag.upsert({
      where: { name: '技術書' },
      update: {},
      create: { name: '技術書' },
    }),
    prisma.tag.upsert({
      where: { name: 'ビジネス' },
      update: {},
      create: { name: 'ビジネス' },
    }),
    prisma.tag.upsert({
      where: { name: '自己啓発' },
      update: {},
      create: { name: '自己啓発' },
    }),
    prisma.tag.upsert({
      where: { name: 'マンガ' },
      update: {},
      create: { name: 'マンガ' },
    }),
  ])

  console.log('Created tags:', tags.map(t => t.name))

  // サンプル本の作成
  const book1 = await prisma.book.create({
    data: {
      title: 'リーダブルコード',
      author: 'Dustin Boswell, Trevor Foucher',
      publisher: 'オライリージャパン',
      isbn: '9784873115658',
      status: 'FINISHED',
      owned: true,
      purchaseDate: new Date('2023-01-15'),
      finishedDate: new Date('2023-02-20'),
      rating: 5,
      memo: '良書。繰り返し読みたい。',
      review: 'コードの可読性を高めるための実践的なテクニックが詰まった良書。変数名の付け方から、コメントの書き方、制御フローの改善まで、すぐに使える知識が満載。プログラマー必読。',
      coverUrl: 'https://covers.openlibrary.org/b/isbn/9784873115658-L.jpg',
      tags: {
        create: [{ tagId: tags[1].id }],
      },
    },
  })

  const book2 = await prisma.book.create({
    data: {
      title: '1984',
      author: 'George Orwell',
      publisher: 'Penguin Books',
      isbn: '9780451524935',
      status: 'READING',
      owned: true,
      purchaseDate: new Date('2024-06-01'),
      rating: null,
      memo: '途中まで読んだ',
      coverUrl: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg',
      tags: {
        create: [{ tagId: tags[0].id }],
      },
    },
  })

  const book3 = await prisma.book.create({
    data: {
      title: '7つの習慣',
      author: 'スティーブン・R・コヴィー',
      publisher: 'キングベアー出版',
      isbn: '9784863940246',
      status: 'UNREAD',
      owned: true,
      purchaseDate: new Date('2024-10-01'),
      coverUrl: 'https://covers.openlibrary.org/b/isbn/9784863940246-L.jpg',
      tags: {
        create: [
          { tagId: tags[2].id },
          { tagId: tags[3].id },
        ],
      },
    },
  })

  const book4 = await prisma.book.create({
    data: {
      title: 'Clean Architecture',
      author: 'Robert C. Martin',
      publisher: 'KADOKAWA',
      isbn: '9784048930659',
      status: 'WISHLIST',
      owned: false,
      price: 3520,
      plannedPurchaseDate: new Date('2025-03-01'),
      purchaseUrl: 'https://www.amazon.co.jp/dp/4048930656',
      priority: 1,
      coverUrl: 'https://covers.openlibrary.org/b/isbn/9784048930659-L.jpg',
      tags: {
        create: [{ tagId: tags[1].id }],
      },
    },
  })

  const book5 = await prisma.book.create({
    data: {
      title: 'Atomic Habits',
      author: 'James Clear',
      publisher: 'Avery',
      isbn: '9780735211292',
      status: 'WISHLIST',
      owned: false,
      price: 2800,
      priority: 2,
      coverUrl: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
      tags: {
        create: [{ tagId: tags[3].id }],
      },
    },
  })

  console.log('Created books:', [book1.title, book2.title, book3.title, book4.title, book5.title])
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
