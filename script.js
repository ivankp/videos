const $ = (p, ...args) => {
  if (p.constructor === String) {
    p = document.getElementById(p);
  }
  for (let x of args) {
    if (x.constructor === String) {
      p = p.appendChild( (p instanceof SVGElement || x==='svg')
        ? document.createElementNS('http://www.w3.org/2000/svg', x)
        : document.createElement(x)
      );
    } else if (x.nodeType === Node.ELEMENT_NODE) {
      p.appendChild(x);
    } else if (x.constructor === Array) {
      p.classList.add(...x);
    } else if (x.constructor === Function) {
      x(p);
    } else if (x.constructor === Object) {
      for (const [key,val] of Object.entries(x)) {
        if (key==='style') {
          for (const [k,v] of Object.entries(val)) {
            if (v!==null) p.style[k] = v;
            else p.style.removeProperty(k);
          }
        } else if (key==='events') {
          for (const [k,v] of Object.entries(val)) {
            if (v!==null) p.addEventListener(k,v);
            else p.removeEventListener(k);
          }
        } else if (key==='text') {
          p.textContent = val;
        } else {
          if (val!==null) {
            if (p instanceof SVGElement)
              p.setAttributeNS(null,key,val);
            else
              p.setAttribute(key,val);
          } else {
            if (p instanceof SVGElement)
              p.removeAttributeNS(null,key);
            else
              p.removeAttribute(key);
          }
        }
      }
    }
  }
  return p;
};
const $$ = (...args) => p => $(p, ...args);

const $then = (x, f) => x != null ? f(x) : null;

const months = ['Jan','Feb','Mar','Apr','May','June','July','Aug','Sep','Oct','Nov','Dec'];

const $fetch = async (url, json = true) => {
  try {
    const resp = await fetch(url, { referrer: '' });
    if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
    return await json ? resp.json() : resp.text();
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

const date = d => {
  d = new Date(d);
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

document.addEventListener('DOMContentLoaded', () => {
  $fetch('videos.json').then(videos => {
    const table = $(document.body, 'table', { id: 'videos' });
    for (const video of videos.videos) {
      $(table, 'tr',
        $$('td',
          'a', { href: 'https://youtu.be/' + video.id },
          'img', ['thumb'], {
            src: 'https://img.youtube.com/vi/' + video.id + '/mqdefault.jpg',
            loading: 'lazy'
          }
        ),
        $$('td', 'table', ['info'], t => {
          const channel = videos.channels[video.channel];
          $(t, 'tr', 'td',
            channel ? $$('a', ['channel'], { href: 'https://www.youtube.com/' + (
                channel.at ? '@' + channel.at : 'channel/' + channel.id
              ) },
                $$('img', { src: channel.logo }),
                $$('span', { text: channel.name })
            ) : $$('span', { text: video.channel })
          );
          $(t, 'tr', 'td', { text: video.title });
          $then(video.speaker, text => $(t, 'tr', 'td', { text }));
          if (video.event) {
            const url = videos.events[video.event];
            $(t, 'tr', 'td', ...( url
              ? [ 'a', { text: video.event, href: url } ]
              : [ { text: video.event } ]
            ));
          }
          let d = date(video.uploaded);
          $then(video.found, x => d += ` (${date(x)})`);
          $(t, 'tr', 'td', { text: d });
        })
      );
    }
  });
});
