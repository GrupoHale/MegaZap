export default function Avatar({ name, initials, color = 'blue', size = 'normal', online = false }) {
  return (
    <span className={`avatar avatar-${color} avatar-${size}`}>
      {initials || name?.split(' ').map((part) => part[0]).slice(0, 2).join('')}
      {online && <i className="online-indicator" />}
    </span>
  )
}
