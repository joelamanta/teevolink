/** MD1T / screen receiver — vendor Final DEMO (device UI unchanged) in TeevoLink chrome. */
export default function ReceiverScreenPage() {
  const src = '/xd10/interactive-demo.html?chrome=teevolink&embed=1'

  return (
    <iframe
      title="Receiver screen configuration"
      src={src}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        minHeight: 0,
        border: 'none',
        display: 'block',
        background: 'var(--bg3)',
      }}
    />
  )
}