const icons = {
  settings:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37 1 .608 2.296.07 2.572-1.065z"/><path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0"/></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>',
  userAuthorized:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M6 21v-2a4 4 0 0 1 4-4h4M15 19l2 2 4-4"/></svg>',
  userUnknown:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M6 21v-2a4 4 0 0 1 4-4h3.5M19 22v.01M19 19a2.003 2.003 0 0 0 .914-3.782 1.98 1.98 0 0 0-2.414.483"/></svg>',
  check:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="m5 12 5 5L20 7"/></svg>',
  crown:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="m12 6 4 6 5-4-2 10H5L3 8l5 4z"/></svg>',
  trash:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>',
  gridAdd:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM14 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zM4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM14 17h6m-3-3v6"/></svg>',
  clock:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M12 7v5l3 3"/></svg>',
  users:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M5 7a4 4 0 1 0 8 0 4 4 0 1 0-8 0M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.85"/></svg>',
  playlistAdd:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M19 8H5M5 12h9M11 16H5M15 16h6M18 13v6"/></svg>',
  playFilled:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path fill="currentColor" stroke="none" d="M6 4v16a1 1 0 0 0 1.524.852l13-8a1 1 0 0 0 0-1.704l-13-8A1 1 0 0 0 6 4z"/></svg>',
  close:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M18 6 6 18M6 6l12 12"/></svg>',
  home: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/><path d="M10 12h4v4h-4z"/></svg>',
  dots: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M4 12a1 1 0 1 0 2 0 1 1 0 1 0-2 0M11 12a1 1 0 1 0 2 0 1 1 0 1 0-2 0M18 12a1 1 0 1 0 2 0 1 1 0 1 0-2 0"/></svg>',
  zzz: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M4 12h6l-6 8h6M14 4h6l-6 8h6"/></svg>',
  chevronRight:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="m9 6 6 6-6 6"/></svg>',
  chevronDown:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="m6 9 6 6 6-6"/></svg>',
  chevronLeft:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="m15 6-6 6 6 6"/></svg>',
  chevronCompactRight:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="m11 4 3 8-3 8"/></svg>',
  search:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M3 10a7 7 0 1 0 14 0 7 7 0 1 0-14 0M21 21l-6-6"/></svg>',
  plus: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M12 5v14M5 12h14"/></svg>',
  sidebarLeftCollapse:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM9 4v16"/><path d="m15 10-2 2 2 2"/></svg>',
  sidebarRightCollapse:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM15 4v16"/><path d="m9 10 2 2-2 2"/></svg>',
  arrowLeft:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M5 12h14M5 12l6 6M5 12l6-6"/></svg>',
  play: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M7 4v16l13-8z"/></svg>',
  pause:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M6 6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM14 6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"/></svg>',
  message:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M8 9h8M8 13h6M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-5l-5 3v-3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h12z"/></svg>',
  maximize:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v2M16 20h2a2 2 0 0 0 2-2v-2"/></svg>',
  minimize:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M15 19v-2a2 2 0 0 1 2-2h2M15 5v2a2 2 0 0 0 2 2h2M5 15h2a2 2 0 0 1 2 2v2M5 9h2a2 2 0 0 0 2-2V5"/></svg>',
  volume:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M15 8a5 5 0 0 1 0 8M17.7 5a9 9 0 0 1 0 14M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5L6 15"/></svg>',
  volumeLow:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M15 8a5 5 0 0 1 0 8M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5L6 15"/></svg>',
  volumeOff:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M15 8a5 5 0 0 1 1.912 4.934m-1.377 2.602A5 5 0 0 1 15 16M17.7 5a9 9 0 0 1 2.362 11.086m-1.676 2.299A9 9 0 0 1 17.7 19M9.069 5.054 9.5 4.5A.8.8 0 0 1 11 5v2m0 4v8a.8.8 0 0 1-1.5.5L6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l1.294-1.664M3 3l18 18"/></svg>',
  pip: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M11 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/><path d="M14 15a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1z"/></svg>',
  sheriffStarFilled:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"/><path d="M8.433 6H3l-.114.006a1 1 0 0 0-.743 1.508L4.833 12l-2.69 4.486-.054.1A1 1 0 0 0 3 18h5.434l2.709 4.514.074.108a1 1 0 0 0 1.64-.108L15.565 18H21l.114-.006a1 1 0 0 0 .743-1.508L19.166 12l2.691-4.486.054-.1A1 1 0 0 0 21 6h-5.434l-2.709-4.514a1 1 0 0 0-1.714 0L8.433 6z"/></svg>',
  dollarFilled:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 3.34A10 10 0 1 1 2 12l.005-.324A10 10 0 0 1 17 3.34zM12 6a1 1 0 0 0-1 1 3 3 0 1 0 0 6v2a1.024 1.024 0 0 1-.866-.398l-.068-.101a1 1 0 0 0-1.732.998 3 3 0 0 0 2.505 1.5H11a1 1 0 0 0 .883.994L12 18a1 1 0 0 0 1-1l.176-.005A3 3 0 0 0 13 11V9c.358-.012.671.14.866.398l.068.101a1 1 0 0 0 1.732-.998A3 3 0 0 0 13.161 7H13a1 1 0 0 0-1-1zm1 7a1 1 0 0 1 0 2v-2zm-2-4v2a1 1 0 0 1 0-2z"/></svg>',
  liveFilled:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 6a6 6 0 1 1-6 6l.004-.225A6 6 0 0 1 12 6m0 4a2 2 0 0 0-1.995 1.85L10 12a2 2 0 1 0 2-2m3.9 9.11a1 1 0 0 1 .993.883l.007.127a1 1 0 0 1-1.993.117l-.007-.127a1 1 0 0 1 1-1m3.14-2.5a1 1 0 0 1 .993.883l.007.127a1 1 0 0 1-1.993.117l-.007-.127a1 1 0 0 1 1-1M20.77 13a1 1 0 0 1 .993.883l.007.127a1 1 0 0 1-1.993.117L19.77 14a1 1 0 0 1 1-1m0-4a1 1 0 0 1 .993.883l.007.127a1 1 0 0 1-1.993.117L19.77 10a1 1 0 0 1 1-1m-1.73-3.61a1 1 0 0 1 1 1 1 1 0 1 1-2 .01c0-.562.448-1.01 1-1.01m-3.14-2.5a1 1 0 0 1 1 1 1 1 0 1 1-2 .01c0-.562.448-1.01 1-1.01M12 2a1 1 0 0 1 1 1 1 1 0 1 1-2 .01c0-.562.448-1.01 1-1.01m-3.9.89a1 1 0 0 1 1 1 1 1 0 1 1-2 .01c0-.562.448-1.01 1-1.01m-3.14 2.5a1 1 0 0 1 1 1 1 1 0 1 1-2 .01c0-.562.448-1.01 1-1.01M3.23 9a1 1 0 0 1 .993.883l.007.127a1 1 0 0 1-1.993.117L2.23 10a1 1 0 0 1 1-1m0 4a1 1 0 0 1 .993.883l.007.127a1 1 0 0 1-1.993.117L2.23 14a1 1 0 0 1 1-1m1.73 3.61a1 1 0 0 1 .993.883l.007.127a1 1 0 0 1-1.993.117l-.007-.127a1 1 0 0 1 1-1m3.14 2.5a1 1 0 0 1 .993.883l.007.127a1 1 0 0 1-1.993.117L7.1 20.11a1 1 0 0 1 1-1M12 20a1 1 0 0 1 .993.883l.007.127a1 1 0 0 1-1.993.117L11 21a1 1 0 0 1 1-1"/></svg>',
  barsDifferent:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke="none" d="M0 0h24v24H0z"/><path d="M4 20h3M17 20h3M10.5 20h3M4 16h3M17 16h3M10.5 16h3M4 12h3M17 12h3M10.5 12h3M4 8h3M17 8h3M4 4h3"/></svg>',
} as const;

export default icons;
