"""Rebuild mobile-only WebP copies from existing JPEG derivatives. No upscaling.
Incremental (2026-11-28): a WebP that already exists and is newer than its source JPEG is kept as is,
so only new or replaced photos are encoded. Output is byte-identical to a full run. Use --all to re-encode everything."""
from pathlib import Path
from PIL import Image, ImageOps
import json,re,hashlib,sys
FORCE='--all' in sys.argv
root=Path(__file__).resolve().parents[1] if Path(__file__).parent.name=='src' else Path(r'C:\Users\nomo\out-and-about')
out=root/'src'/'mobile-images'; out.mkdir(exist_ok=True)
rels=set()
for page in [*(root/'stories').glob('*/index.html'),root/'stories/index.html',*(root/'series').glob('*/index.html')]:
 for tag in re.findall(r'<img\s[^>]+>',page.read_text(encoding='utf-8')):
  match=re.search(r'src="/([^"?]+\.jpg)"',tag)
  if not match: continue
  rel=re.sub(r'\.[msl]\.jpg$','.jpg',match[1]); rels.add(rel)
manifest={};before=after=0;encoded=skipped=0
for rel in sorted(rels):
 original=root/rel
 if not original.exists():continue
 with Image.open(original) as im: base_ratio=im.width/im.height
 stem=original.with_suffix(''); candidates=[Path(str(stem)+'.s.jpg'),Path(str(stem)+'.m.jpg')]
 candidates=[p for p in candidates if p.exists()] or [original]
 variants=[];seen=set()
 for p in candidates:
  with Image.open(p) as im:
   im=ImageOps.exif_transpose(im).convert('RGB')
   if abs(im.width/im.height-base_ratio)>.03:continue
   im.thumbnail((720,2000),Image.Resampling.LANCZOS)
   if im.width in seen:continue
   seen.add(im.width)
   name=hashlib.sha256((rel+str(im.width)).encode()).hexdigest()[:16]+'.webp'
   dest=out/name
   if FORCE or not dest.exists() or dest.stat().st_size==0 or dest.stat().st_mtime<p.stat().st_mtime:
    im.save(dest,'WEBP',quality=82,method=6);encoded+=1
   else:skipped+=1
   variants.append({'file':name,'width':im.width,'height':im.height})
   before+=p.stat().st_size;after+=(out/name).stat().st_size
 if variants:manifest[rel]=sorted(variants,key=lambda x:x['width'])
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'images':len(manifest),'variants':sum(map(len,manifest.values())),'source_bytes':before,'webp_bytes':after,'saving_percent':round((1-after/before)*100,1),'encoded':encoded,'skipped':skipped}))
