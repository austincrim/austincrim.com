import { component, defineMarkdocConfig, nodes } from "@astrojs/markdoc/config"

export default defineMarkdocConfig({
  nodes: {
    fence: {
      ...nodes.fence,
      transform(node) {
        const language = node.attributes.language || ''
        const content = node.attributes.content
        if (language === 'js-preview') {
          console.log('Preview node')
          return {
            $type: 'Preview',
            code: content
          }
        }
        return node
      }
    }
  },
  tags: {
    Preview: {
      render: component('./src/lib/Preview.astro'),
      attributes: {
        code: { type: 'String' }
      }
    }
  }
})
