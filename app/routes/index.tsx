import type { Appearance as TAppearance, Post, Project } from '@prisma/client'
import type { LoaderFunction, MetaFunction, HeadersFunction } from 'remix'
import { json, useLoaderData, Link } from 'remix'
import Appearance from '~/components/Appearance'
import Footer from '~/components/Footer'
import Hero from '~/components/Hero'
import { RightArrow } from '~/components/Icons'
import Layout from '~/components/Layout'
import PostPreview from '~/components/PostPreview'
import ProjectCard from '~/components/ProjectCard'
import Section from '~/components/Section'
import { getAppearances } from '~/lib/appearances'
import { getPosts } from '~/lib/posts.server'
import { getProjects } from '~/lib/projects'

export let meta: MetaFunction = () => {
  return {
    title: 'Austin Crim | building for the web',
    description: 'The personal website of Austin Crim, a builder for the web',
    'og:title': 'The personal website of Austin Crim, a builder for the web',
    'og:image': 'https://austincrim.com/og/index.png',
    'twitter:card': 'summary_large_image',
    'og:url': 'https://austincrim.com'
  }
}

export let loader: LoaderFunction = async () => {
  const [posts, projects, appearances] = await Promise.all([
    getPosts({ take: 3, orderBy: { hits: 'desc' } }),
    getProjects(),
    getAppearances()
  ])

  return json({ posts, projects, appearances })
}

export let headers: HeadersFunction = () => {
  return {
    'cache-control': `smax-age=${60 * 60 * 3}`
  }
}

export default function Index() {
  let { posts, projects, appearances } = useLoaderData<{
    posts: Post[]
    projects: Project[]
    appearances: TAppearance[]
  }>()

  return (
    <>
      <Layout>
        <main>
          <Hero />
          <Section title="Places I Have Appeared" id="appearances">
            <ul className="flex flex-col gap-20 py-8">
              {appearances.map((appearance) => (
                <li key={appearance.title}>
                  <Appearance appearance={appearance} />
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Things I Have Written" id="blog">
            <div className="flex flex-col gap-10 py-8">
              <ul className="flex flex-col gap-20 ">
                {posts.map((post) => (
                  <li key={post.slug}>
                    <PostPreview post={post} />
                  </li>
                ))}
              </ul>
              <Link
                className="self-end text-lg font-semibold transition-colors text-primary hover:text-secondary group"
                to="/blog"
              >
                <span className="mr-1">Read more</span>
                <span className="inline-block align-middle transition-transform transform group-hover:translate-x-1">
                  <RightArrow />
                </span>
              </Link>
            </div>
          </Section>
          <Section title="Things I Have Built" id="portfolio">
            <ul className="flex flex-col gap-10">
              {projects.map((project) => (
                <li key={project.title}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          </Section>
        </main>

        <Footer>
          <div className="flex flex-col items-center gap-4">
            <a
              className="font-medium underline"
              href="mailto:aust.crim@gmail.com"
            >
              Say Hi
            </a>
            <span>Designed and developed by Austin Crim</span>
          </div>
        </Footer>
      </Layout>
    </>
  )
}
