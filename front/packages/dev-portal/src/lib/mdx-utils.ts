import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'

export async function getStaticPropsForMdx(slug: string) {
  const contentDir = path.join(process.cwd(), 'src/content')
  const filePath = path.join(contentDir, `${slug}.mdx`)
  const fileContent = await fs.readFile(filePath, 'utf8')

  const { content, data: frontmatter } = matter(fileContent)
  const source = await serialize(content, {
    mdxOptions: { remarkPlugins: [] }
  })

  return { source, frontmatter }
}
