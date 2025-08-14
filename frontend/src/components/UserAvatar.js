import React from 'react';

function UserAvatar({ name, size = 'sm' }) {
  function getInitials(s) {
    return s.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2);
  }
  function getAvatarColor(s) {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500', 'bg-red-500'];
    const index = s.length % colors.length;
    return colors[index];
  }
  const sizeClasses = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base' };
  return <div className={`${sizeClasses[size]} ${getAvatarColor(name)} rounded-full flex items-center justify-center text-white font-medium`}>{getInitials(name)}</div>;
}

export default UserAvatar;


