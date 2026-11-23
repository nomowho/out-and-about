# Regenerate homepage-only mobile WebP derivatives (requires Pillow).
# Run: python src/optimize-home-images.py. Original images remain untouched.
import json
from pathlib import Path
from PIL import Image, ImageOps
root=Path(__file__).resolve().parent.parent
previous=json.loads((root/'src/home-images/manifest.json').read_text(encoding='utf-8'))
inputs={'images':[{'key':key,'src':entry['source']} for key,entry in previous.items()]}
out=root/'src/home-images'
out.mkdir(exist_ok=True)
manifest={}
for kind,rows in inputs.items():
    for row in rows:
        base=root/row['src']
        small=base.with_name(base.stem+'.s.jpg')
        medium=base.with_name(base.stem+'.m.jpg')
        # Reuse existing mobile resolution and softness; never upscale a thumbnail.
        chosen=small if small.exists() and Image.open(small).width>=600 else medium if medium.exists() and Image.open(medium).width<=720 else base
        original=ImageOps.exif_transpose(Image.open(chosen)).convert('RGB')
        versions=[]
        for width in (480,720):
            w=min(width,original.width)
            if any(v['width']==w for v in versions):continue
            im=original.resize((w,round(original.height*w/original.width)),Image.Resampling.LANCZOS)
            name=f"{row['key']}-{w}.webp"
            im.save(out/name,'WEBP',quality=80,method=6)
            versions.append({'file':name,'width':w,'height':im.height,'bytes':(out/name).stat().st_size})
        manifest[row['key']]={'source':row['src'],'compressionSource':str(chosen.relative_to(root)).replace('\\','/'),'variants':versions}
        print(row['key'],[(v['width'],v['bytes']) for v in versions])
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')

expected={v['file'] for entry in manifest.values() for v in entry['variants']}
for obsolete in out.glob('*.webp'):
    if obsolete.name not in expected and any(obsolete.name.startswith(key+'-') for key in manifest):
        obsolete.unlink()
