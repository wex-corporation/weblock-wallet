export const MDXComponents = {
  h1: (props: any) => <h1 className="text-3xl font-bold" {...props} />,
  h2: (props: any) => <h2 className="text-2xl font-semibold" {...props} />,
  p: (props: any) => <p className="text-base my-2" {...props} />,
  code: (props: any) => <code className="bg-gray-100 p-1 rounded" {...props} />,
  pre: (props: any) => (
    <pre className="bg-gray-900 text-white p-4 rounded" {...props} />
  )
}
