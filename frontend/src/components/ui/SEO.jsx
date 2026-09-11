import { useEffect } from 'react'

const SEO = ({
  title = 'MatchWise AI — AI Resume Builder & Job Matching',
  description = 'MatchWise AI is your AI resume builder and ATS resume checker. Optimize your resume, practice role-specific mock interviews, and get hired faster.',
  canonical = 'https://matchwiseai.com/',
  noindex = false,
  ogType = 'website',
  ogImage = 'https://matchwiseai.com/og-image.png',
}) => {
  useEffect(() => {
    // 1. Update Title
    document.title = title

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = description

    // 3. Update Robots
    let metaRobots = document.querySelector('meta[name="robots"]')
    if (!metaRobots) {
      metaRobots = document.createElement('meta')
      metaRobots.name = 'robots'
      document.head.appendChild(metaRobots)
    }
    metaRobots.content = noindex ? 'noindex, nofollow' : 'index, follow'

    // 4. Update Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]')
    if (!linkCanonical) {
      linkCanonical = document.createElement('link')
      linkCanonical.rel = 'canonical'
      document.head.appendChild(linkCanonical)
    }
    linkCanonical.href = canonical

    // 5. Open Graph Meta Tags
    const setMetaProperty = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('property', property)
        document.head.appendChild(meta)
      }
      meta.content = content
    }

    setMetaProperty('og:title', title)
    setMetaProperty('og:description', description)
    setMetaProperty('og:type', ogType)
    setMetaProperty('og:url', canonical)
    setMetaProperty('og:image', ogImage)

    // 6. Twitter Meta Tags
    const setMetaName = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.name = name
        document.head.appendChild(meta)
      }
      meta.content = content
    }

    setMetaName('twitter:title', title)
    setMetaName('twitter:description', description)
    setMetaName('twitter:image', ogImage)
  }, [title, description, canonical, noindex, ogType, ogImage])

  return null
}

export default SEO
