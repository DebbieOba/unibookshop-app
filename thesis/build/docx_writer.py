"""Minimal, dependency-free OOXML (.docx) writer.

Built directly on `zipfile` + string templates (both pure stdlib) because
python-docx requires lxml, which this machine's Application Control policy
blocks from loading. Implements exactly what the thesis needs: A4 page,
Times New Roman body text, chapter/section headings, justified paragraphs,
numbered figures/tables with captions, a real inline reference list, an
auto-updating TOC field, multi-section page numbering (lower-roman front
matter -> arabic body), and image embedding — including a working path for
embedding SVG figures (with a required raster fallback per the OOXML SVG
extension) alongside ordinary raster screenshots.
"""
import os
import re
import zipfile
from png_min import write_solid_png, image_size

EMU_PER_IN = 914400
PAGE_W_TW, PAGE_H_TW = 11906, 16838  # A4 in twips
MARGIN_TOP, MARGIN_BOTTOM, MARGIN_RIGHT = 1440, 1440, 1440
MARGIN_LEFT = 2160  # 1.5in binding margin
CONTENT_WIDTH_IN = (PAGE_W_TW - MARGIN_LEFT - MARGIN_RIGHT) / 1440.0  # ~5.75in


def esc(s: str) -> str:
    return (
        str(s)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


RELS_NS = "http://schemas.openxmlformats.org/package/2006/relationships"


class Docx:
    def __init__(self):
        self._body = []
        self._media = []  # (part_name, bytes)
        self._doc_rels = []  # (rId, type, target)
        self._rid = 0
        self._img_n = 0
        self._fig_n = 0
        self._tab_n = 0
        self._footers = {}  # name -> xml
        self._sections = []  # closed sections: xml of sectPr to splice
        self._fallback_png = None

    # ---------- low level helpers ----------
    def _next_rid(self):
        self._rid += 1
        return f"rId{self._rid}"

    def _raw(self, xml):
        self._body.append(xml)

    def _fallback(self):
        if self._fallback_png is None:
            path = os.path.join(os.path.dirname(__file__), "_svg_fallback.png")
            if not os.path.exists(path):
                write_solid_png(path, 96, 72, (230, 234, 240))
            self._fallback_png = path
        return self._fallback_png

    # ---------- runs & paragraphs ----------
    def _run(self, text, bold=False, italic=False, size=None, color=None,
              small_caps=False, underline=False, superscript=False):
        rpr = ""
        if bold:
            rpr += "<w:b/>"
        if italic:
            rpr += "<w:i/>"
        if underline:
            rpr += '<w:u w:val="single"/>'
        if small_caps:
            rpr += "<w:smallCaps/>"
        if superscript:
            rpr += '<w:vertAlign w:val="superscript"/>'
        if size:
            rpr += f'<w:sz w:val="{size*2}"/>'
        if color:
            rpr += f'<w:color w:val="{color}"/>'
        rpr_xml = f"<w:rPr>{rpr}</w:rPr>" if rpr else ""
        text = esc(text)
        return f'<w:r>{rpr_xml}<w:t xml:space="preserve">{text}</w:t></w:r>'

    def paragraph(self, runs, style=None, align=None, spacing_before=0,
                  spacing_after=160, line=360, indent_first=0, keep_next=False):
        """`runs` may be a plain string or a list of run-dicts:
        {'text':..., 'bold':,'italic':,'size':,'color':,'underline':,'superscript':}
        """
        if isinstance(runs, str):
            runs = [{"text": runs}]
        ppr = ""
        if style:
            ppr += f'<w:pStyle w:val="{style}"/>'
        if align:
            ppr += f'<w:jc w:val="{align}"/>'
        ppr += f'<w:spacing w:before="{spacing_before}" w:after="{spacing_after}" w:line="{line}" w:lineRule="auto"/>'
        if indent_first:
            ppr += f'<w:ind w:firstLine="{indent_first}"/>'
        if keep_next:
            ppr += "<w:keepNext/>"
        body = "".join(self._run(**r) if isinstance(r, dict) else self._run(r) for r in runs)
        self._raw(f"<w:p><w:pPr>{ppr}</w:pPr>{body}</w:p>")

    def body_text(self, text_, align="both"):
        """Standard justified body paragraph with a first-line indent."""
        self.paragraph(text_, align=align, indent_first=432)

    def heading(self, text_, level=1, number=None, page_break_before=False,
                center=True, upper=False):
        style = {1: "Heading1", 2: "Heading2", 3: "Heading3"}.get(level, "Heading2")
        label = f"{number}  {text_}" if number else text_
        if upper:
            label = label.upper()
        pbr = "<w:pageBreakBefore/>" if page_break_before else ""
        ppr = f'<w:pStyle w:val="{style}"/>{pbr}'
        ppr += f'<w:jc w:val="{"center" if center else "left"}"/>'
        size = {1: 32, 2: 26, 3: 24}.get(level, 24)
        run = f'<w:r><w:rPr><w:b/><w:sz w:val="{size}"/></w:rPr><w:t xml:space="preserve">{esc(label)}</w:t></w:r>'
        self._raw(f"<w:p><w:pPr>{ppr}</w:pPr>{run}</w:p>")

    def page_break(self):
        self._raw('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')

    def spacer(self, twips=200):
        self._raw(f'<w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p>')

    def hr(self):
        self._raw(
            '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="94A3B8"/></w:pBdr>'
            '<w:spacing w:after="240"/></w:pPr></w:p>'
        )

    # ---------- TOC / lists ----------
    def toc_field(self):
        self._raw(
            '<w:p><w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/></w:r>'
            '<w:r><w:instrText xml:space="preserve"> TOC \\o "1-3" \\h \\z \\u </w:instrText></w:r>'
            '<w:r><w:fldChar w:fldCharType="separate"/></w:r>'
            '<w:r><w:t>Right-click this field and choose "Update Field" (or press F9) '
            "to generate the Table of Contents after opening this document in Word.</w:t></w:r>"
            '<w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>'
        )

    def bullet(self, text_, indent=720):
        self.paragraph(
            [{"text": "•  "}, {"text": text_}],
            spacing_after=80,
        )
        # simple bullet via literal glyph; avoids needing numbering.xml

    def hanging_paragraph(self, runs, hang=576, spacing_after=200, line=360):
        """APA-style hanging indent paragraph (for the reference list)."""
        if isinstance(runs, str):
            runs = [{"text": runs}]
        ppr = (
            f'<w:ind w:left="{hang}" w:hanging="{hang}"/>'
            f'<w:spacing w:before="0" w:after="{spacing_after}" w:line="{line}" w:lineRule="auto"/>'
        )
        body = "".join(self._run(**r) if isinstance(r, dict) else self._run(r) for r in runs)
        self._raw(f"<w:p><w:pPr>{ppr}</w:pPr>{body}</w:p>")

    # ---------- tables ----------
    def table(self, header_row, rows, col_widths_in=None, caption=None,
              number=None, font_size=10.5):
        if caption:
            self._table_caption(number, caption)
        ncols = len(header_row)
        if not col_widths_in:
            w = CONTENT_WIDTH_IN / ncols
            col_widths_in = [w] * ncols
        grid = "".join(f'<w:gridCol w:w="{int(w*1440)}"/>' for w in col_widths_in)

        def cell(txt, bold=False, shade=None):
            shd = f'<w:shd w:val="clear" w:fill="{shade}"/>' if shade else ""
            return (
                f'<w:tc><w:tcPr><w:tcMar><w:top w:w="80" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/>'
                f'<w:left w:w="100" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar>{shd}</w:tcPr>'
                f'<w:p><w:pPr><w:spacing w:after="0" w:line="276" w:lineRule="auto"/></w:pPr>'
                f'<w:r><w:rPr>{"<w:b/>" if bold else ""}<w:sz w:val="{int(font_size*2)}"/></w:rPr>'
                f'<w:t xml:space="preserve">{esc(txt)}</w:t></w:r></w:p></w:tc>'
            )

        rows_xml = "<w:tr>" + "".join(cell(h, bold=True, shade="DCE3F5") for h in header_row) + "</w:tr>"
        for r in rows:
            rows_xml += "<w:tr>" + "".join(cell(c) for c in r) + "</w:tr>"
        tbl = (
            '<w:tbl><w:tblPr><w:tblStyle w:val="ThesisTable"/>'
            f'<w:tblW w:w="{int(CONTENT_WIDTH_IN*1440)}" w:type="dxa"/>'
            '<w:tblBorders>'
            '<w:top w:val="single" w:sz="4" w:color="94A3B8"/>'
            '<w:bottom w:val="single" w:sz="4" w:color="94A3B8"/>'
            '<w:left w:val="single" w:sz="4" w:color="94A3B8"/>'
            '<w:right w:val="single" w:sz="4" w:color="94A3B8"/>'
            '<w:insideH w:val="single" w:sz="4" w:color="CBD5E1"/>'
            '<w:insideV w:val="single" w:sz="4" w:color="CBD5E1"/>'
            "</w:tblBorders></w:tblPr>"
            f"<w:tblGrid>{grid}</w:tblGrid>{rows_xml}</w:tbl>"
        )
        self._raw(tbl)
        self.spacer()

    def _table_caption(self, number, caption):
        self._tab_n += 1
        n = number or self._tab_n
        self.paragraph(
            [{"text": f"Table {n}. ", "bold": True, "italic": True},
             {"text": caption, "italic": True}],
            spacing_before=160, spacing_after=100,
        )

    # ---------- images ----------
    def _register_media(self, filename, data, content_type):
        part = f"word/media/{filename}"
        self._media.append((part, data, content_type))
        rid = self._next_rid()
        self._doc_rels.append((rid, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image", f"media/{filename}"))
        return rid

    def figure_svg(self, svg_path, caption, width_in=CONTENT_WIDTH_IN, aspect=0.66,
                    number=None, source_note=None):
        """Embeds a vector SVG figure with a raster fallback (required by the
        OOXML SVG extension so non-SVG-aware readers still see *something*).
        Modern Word/Microsoft 365 renders the actual SVG.
        """
        self._img_n += 1
        svg_bytes = open(svg_path, "rb").read()
        svg_name = f"image{self._img_n}.svg"
        png_name = f"image{self._img_n}_fallback.png"
        rid_svg = self._register_media(svg_name, svg_bytes, "image/svg+xml")
        # width/height in the SVG's own viewBox, parsed for correct aspect ratio
        m_w = re.search(rb'width="(\d+(?:\.\d+)?)"', svg_bytes)
        m_h = re.search(rb'height="(\d+(?:\.\d+)?)"', svg_bytes)
        if m_w and m_h:
            aspect = float(m_h.group(1)) / float(m_w.group(1))
        write_solid_png(self._fallback(), 8, 8, (230, 234, 240))
        rid_png = self._register_media(png_name, open(self._fallback(), "rb").read(), "image/png")
        self._picture_xml(rid_png, width_in, width_in * aspect, svg_rid=rid_svg)
        self._figure_caption(number, caption, source_note)

    def figure_raster(self, img_path, caption, width_in=CONTENT_WIDTH_IN,
                       number=None, source_note=None, max_width_in=CONTENT_WIDTH_IN):
        self._img_n += 1
        ext = os.path.splitext(img_path)[1].lower().lstrip(".")
        ctype = "image/png" if ext == "png" else "image/jpeg"
        name = f"image{self._img_n}.{ext}"
        data = open(img_path, "rb").read()
        rid = self._register_media(name, data, ctype)
        w_px, h_px = image_size(img_path)
        aspect = h_px / w_px
        w_in = min(width_in, max_width_in)
        self._picture_xml(rid, w_in, w_in * aspect)
        self._figure_caption(number, caption, source_note)

    def _picture_xml(self, rid_png, width_in, height_in, svg_rid=None):
        cx, cy = int(width_in * EMU_PER_IN), int(height_in * EMU_PER_IN)
        self._img_n_ref = self._img_n
        ext_svg = ""
        if svg_rid:
            ext_svg = (
                '<a:extLst><a:ext uri="{96DAC541-7B7A-43D3-8B79-37D633B846F1}">'
                f'<asvg:svgBlip xmlns:asvg="http://schemas.microsoft.com/office/drawing/2016/SVG/main" r:embed="{svg_rid}"/>'
                "</a:ext></a:extLst>"
            )
        xml = (
            '<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="160" w:after="60"/></w:pPr>'
            '<w:r><w:drawing>'
            f'<wp:inline distT="0" distB="0" distL="0" distR="0">'
            f'<wp:extent cx="{cx}" cy="{cy}"/>'
            '<wp:effectExtent l="0" t="0" r="0" b="0"/>'
            f'<wp:docPr id="{self._img_n_ref}" name="Figure{self._img_n_ref}"/>'
            '<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>'
            '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
            '<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
            '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
            f'<pic:nvPicPr><pic:cNvPr id="{self._img_n_ref}" name="Figure{self._img_n_ref}"/><pic:cNvPicPr/></pic:nvPicPr>'
            f'<pic:blipFill><a:blip r:embed="{rid_png}">{ext_svg}</a:blip>'
            '<a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
            f'<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>'
            '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'
            "</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>"
        )
        self._raw(xml)

    def _figure_caption(self, number, caption, source_note=None):
        self._fig_n += 1
        n = number or self._fig_n
        runs = [{"text": f"Figure {n}. ", "bold": True, "italic": True},
                {"text": caption, "italic": True}]
        self.paragraph(runs, align="center", spacing_before=0, spacing_after=60)
        if source_note:
            self.paragraph([{"text": source_note, "size": 9.5, "color": "64748B"}],
                            align="center", spacing_after=200)
        else:
            self.spacer()

    # ---------- sections (page-numbering resets) ----------
    def add_footer_part(self, key, fmt="decimal", start=1, prefix="", show=True):
        """Registers a footer XML part (centered page number)."""
        if not show:
            xml = "<w:ftr xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:p/></w:ftr>"
        else:
            xml = (
                '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
                '<w:p><w:pPr><w:jc w:val="center"/></w:pPr>'
                f'<w:r><w:t xml:space="preserve">{esc(prefix)}</w:t></w:r>'
                '<w:r><w:fldChar w:fldCharType="begin"/></w:r>'
                '<w:r><w:instrText xml:space="preserve"> PAGE   \\* MERGEFORMAT </w:instrText></w:r>'
                '<w:r><w:fldChar w:fldCharType="end"/></w:r>'
                "</w:p></w:ftr>"
            )
        self._footers[key] = xml

    def close_section(self, pg_fmt="decimal", start=1, footer_key=None):
        """Ends the current section here (inserted as sectPr on the LAST
        paragraph of the section, per OOXML rules) and begins a new one."""
        ftr_ref = ""
        if footer_key:
            rid = self._next_rid()
            fname = f"footer{len(self._sections)+2}.xml"
            self._doc_rels.append((rid, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer", fname))
            self._pending_footer = (fname, self._footers[footer_key])
            ftr_ref = f'<w:footerReference w:type="default" r:id="{rid}"/>'
        sect_pr = (
            f'<w:sectPr>{ftr_ref}'
            f'<w:pgSz w:w="{PAGE_W_TW}" w:h="{PAGE_H_TW}"/>'
            f'<w:pgMar w:top="{MARGIN_TOP}" w:right="{MARGIN_RIGHT}" w:bottom="{MARGIN_BOTTOM}" '
            f'w:left="{MARGIN_LEFT}" w:header="720" w:footer="720" w:gutter="0"/>'
            f'<w:pgNumType w:fmt="{pg_fmt}" w:start="{start}"/>'
            '<w:titlePg/>'
            "</w:sectPr>"
        )
        # splice sectPr into an empty paragraph marking the section boundary
        self._raw(f"<w:p><w:pPr>{sect_pr}</w:pPr></w:p>")
        if footer_key:
            self._sections.append(self._pending_footer)

    def final_section(self, pg_fmt="decimal", start=1, footer_key=None):
        ftr_ref = ""
        if footer_key:
            rid = self._next_rid()
            fname = f"footer{len(self._sections)+2}.xml"
            self._doc_rels.append((rid, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer", fname))
            self._sections.append((fname, self._footers[footer_key]))
            ftr_ref = f'<w:footerReference w:type="default" r:id="{rid}"/>'
        self._final_sect_pr = (
            f'<w:sectPr>{ftr_ref}'
            f'<w:pgSz w:w="{PAGE_W_TW}" w:h="{PAGE_H_TW}"/>'
            f'<w:pgMar w:top="{MARGIN_TOP}" w:right="{MARGIN_RIGHT}" w:bottom="{MARGIN_BOTTOM}" '
            f'w:left="{MARGIN_LEFT}" w:header="720" w:footer="720" w:gutter="0"/>'
            f'<w:pgNumType w:fmt="{pg_fmt}" w:start="{start}"/>'
            "</w:sectPr>"
        )

    # ---------- save ----------
    def save(self, path, title="Thesis", author="Author"):
        body_xml = "".join(self._body) + getattr(self, "_final_sect_pr", "<w:sectPr/>")
        document_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
            'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" '
            'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
            'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
            f"<w:body>{body_xml}</w:body></w:document>"
        )

        content_types = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Default Extension="svg" ContentType="image/svg+xml"/>'
            '<Default Extension="png" ContentType="image/png"/>'
            '<Default Extension="jpeg" ContentType="image/jpeg"/>'
            '<Default Extension="jpg" ContentType="image/jpeg"/>'
            '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
            '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
            '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>'
            '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>'
            '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
        )
        for i in range(len(self._sections)):
            content_types += f'<Override PartName="/word/footer{i+2}.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>'
        content_types += "</Types>"

        root_rels = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            f'<Relationships xmlns="{RELS_NS}">'
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>'
            '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>'
            "</Relationships>"
        )

        doc_rels_items = "".join(
            f'<Relationship Id="{rid}" Type="{t}" Target="{target}"/>' for rid, t, target in self._doc_rels
        )
        doc_rels_items += (
            '<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            '<Relationship Id="rIdSettings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>'
        )
        doc_rels = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="{RELS_NS}">{doc_rels_items}</Relationships>'

        core_props = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '
            'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" '
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
            f"<dc:title>{esc(title)}</dc:title><dc:creator>{esc(author)}</dc:creator>"
            "</cp:coreProperties>"
        )
        app_props = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">'
            "<Application>ThesisBuilder</Application></Properties>"
        )
        settings_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            '<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            '<w:updateFields w:val="true"/><w:defaultTabStop w:val="720"/>'
            "</w:settings>"
        )
        styles_xml = _styles_xml()

        with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
            z.writestr("[Content_Types].xml", content_types)
            z.writestr("_rels/.rels", root_rels)
            z.writestr("docProps/core.xml", core_props)
            z.writestr("docProps/app.xml", app_props)
            z.writestr("word/document.xml", document_xml)
            z.writestr("word/_rels/document.xml.rels", doc_rels)
            z.writestr("word/styles.xml", styles_xml)
            z.writestr("word/settings.xml", settings_xml)
            for fname, xml in self._sections:
                z.writestr(f"word/{fname}", xml)
            for part, data, _ct in self._media:
                z.writestr(part, data)
        return path


def _styles_xml():
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr>
<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
<w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="en-US"/>
</w:rPr></w:rPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal">
<w:name w:val="Normal"/>
<w:pPr><w:spacing w:after="160" w:line="360" w:lineRule="auto"/></w:pPr>
</w:style>
<w:style w:type="paragraph" w:styleId="Heading1">
<w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/>
<w:pPr><w:keepNext/><w:spacing w:before="240" w:after="240"/><w:outlineLvl w:val="0"/></w:pPr>
<w:rPr><w:b/><w:sz w:val="32"/></w:rPr>
</w:style>
<w:style w:type="paragraph" w:styleId="Heading2">
<w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/>
<w:pPr><w:keepNext/><w:spacing w:before="240" w:after="160"/><w:outlineLvl w:val="1"/></w:pPr>
<w:rPr><w:b/><w:sz w:val="26"/></w:rPr>
</w:style>
<w:style w:type="paragraph" w:styleId="Heading3">
<w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/>
<w:pPr><w:keepNext/><w:spacing w:before="200" w:after="120"/><w:outlineLvl w:val="2"/></w:pPr>
<w:rPr><w:b/><w:i/><w:sz w:val="24"/></w:rPr>
</w:style>
<w:style w:type="table" w:styleId="ThesisTable">
<w:name w:val="ThesisTable"/><w:basedOn w:val="TableNormal"/>
</w:style>
</w:styles>"""
