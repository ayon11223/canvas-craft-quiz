import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, SlidersHorizontal, ZoomIn, ZoomOut } from "lucide-react";
import { useMcq, LABEL_STYLES, type Question, type TickStyle } from "@/lib/mcq-store";
import {
  useProjectSettings,
  PAGE_DIMS,
  formatQNumber,
  formatPageNum,
  type ProjectSettings,
} from "@/lib/project-settings";
import { Shape } from "./Shape";

const MM_PER_PT = 0.3528;

export function PrintPreview() {
  const { previewOpen, setPreviewOpen, setProjectSettingsOpen, questions } = useMcq();
  const { settings } = useProjectSettings();
  const [zoom, setZoom] = useState(0.7);
  const [pages, setPages] = useState<Question[][]>([[...questions]]);
  const measureRef = useRef<HTMLDivElement>(null);

  const dims = useMemo(() => {
    const d = PAGE_DIMS[settings.pageSize];
    return settings.orientation === "landscape" ? { w: d.h, h: d.w } : d;
  }, [settings.pageSize, settings.orientation]);

  const headerH = settings.showHeader ? 10 : 0;
  const footerH = settings.showFooter || settings.showPageNumbers ? 10 : 0;
  const contentH = dims.h - 2 * settings.margin - headerH - footerH;
  const contentW = dims.w - 2 * settings.margin;

  // Greedy paginate via measurement
  useLayoutEffect(() => {
    if (!previewOpen) return;
    const m = measureRef.current;
    if (!m) return;
    const nodes = Array.from(m.querySelectorAll("[data-q]")) as HTMLElement[];
    // Available height per column, in CSS px. We measure at the same scale (1mm = 3.78px @ 96dpi).
    const pxPerMm = m.clientWidth / contentW;
    const colH = contentH * pxPerMm;
    const newPages: Question[][] = [];
    let currentPage: Question[] = [];
    let currentColH = 0;
    let currentColIdx = 0;
    const cols = settings.columns;

    nodes.forEach((n, i) => {
      const h = n.getBoundingClientRect().height + 4;
      if (currentColH + h > colH) {
        currentColIdx++;
        currentColH = 0;
        if (currentColIdx >= cols) {
          newPages.push(currentPage);
          currentPage = [];
          currentColIdx = 0;
        }
      }
      currentColH += h;
      currentPage.push(questions[i]);
    });
    if (currentPage.length) newPages.push(currentPage);
    if (newPages.length === 0) newPages.push([]);
    setPages(newPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewOpen, questions, settings, contentH, contentW]);

  const close = () => setPreviewOpen(false);
  const doPrint = () => window.print();

  return (
    <AnimatePresence>
      {previewOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-background flex flex-col pdf-export-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Toolbar (hidden when printing) */}
          <div className="pdf-no-print flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-toolbar shrink-0">
            <button
              onClick={close}
              aria-label="Close preview"
              className="size-9 grid place-items-center rounded-full hover:bg-secondary text-foreground"
            >
              <X className="size-4" />
            </button>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <button
                onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
                className="size-8 grid place-items-center rounded-full hover:bg-secondary"
              >
                <ZoomOut className="size-4" />
              </button>
              <span className="tabular-nums w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                className="size-8 grid place-items-center rounded-full hover:bg-secondary"
              >
                <ZoomIn className="size-4" />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setProjectSettingsOpen(true)}
                aria-label="Settings"
                className="size-9 grid place-items-center rounded-full hover:bg-secondary text-foreground"
              >
                <SlidersHorizontal className="size-4" />
              </button>
              <button
                onClick={doPrint}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full pl-3 pr-4 py-1.5 text-xs font-semibold"
              >
                <Printer className="size-3.5" /> Export PDF
              </button>
            </div>
          </div>

          {/* Hidden measurement layer */}
          <div
            aria-hidden
            className="pdf-no-print absolute opacity-0 pointer-events-none"
            style={{
              width: `${(contentW - (settings.columns - 1) * settings.columnGap) / settings.columns}mm`,
              left: -9999,
              top: 0,
            }}
            ref={measureRef}
          >
            {questions.map((q, i) => (
              <div data-q key={q.id}>
                <QuestionBlock q={q} index={i} settings={settings} />
              </div>
            ))}
          </div>

          {/* Pages */}
          <div className="flex-1 overflow-auto bg-background py-6">
            <div className="flex flex-col items-center gap-6">
              {pages.map((pageQs, pageIdx) => {
                const startIdx = pages.slice(0, pageIdx).reduce((s, p) => s + p.length, 0);
                const pageWpx = dims.w * 3.78 * zoom;
                const pageHpx = dims.h * 3.78 * zoom;
                return (
                  <div
                    key={pageIdx}
                    style={{ width: pageWpx, height: pageHpx, position: "relative" }}
                  >
                    <div
                      className="pdf-page"
                      style={{
                        width: `${dims.w}mm`,
                        height: `${dims.h}mm`,
                        padding: `${settings.margin}mm`,
                        fontFamily: settings.fontFamily,
                        fontSize: `${settings.fontSize}pt`,
                        lineHeight: settings.lineHeight,
                        transform: `scale(${zoom})`,
                        transformOrigin: "top left",
                        position: "absolute",
                        top: 0,
                        left: 0,
                      }}
                    >
                    <div className="flex flex-col h-full">
                      {settings.showHeader && (
                        <div
                          className="text-center font-semibold border-b border-black/40 pb-1 mb-2 shrink-0"
                          style={{ fontSize: `${settings.fontSize + 1}pt` }}
                        >
                          {settings.headerText}
                        </div>
                      )}
                      <div
                        className="flex-1 min-h-0"
                        style={{
                          columnCount: settings.columns,
                          columnGap: `${settings.columnGap}mm`,
                          columnFill: "auto",
                        }}
                      >
                        {pageQs.map((q, i) => (
                          <div key={q.id} className="pdf-question mb-2">
                            <QuestionBlock q={q} index={startIdx + i} settings={settings} />
                          </div>
                        ))}
                      </div>
                      {(settings.showFooter || settings.showPageNumbers) && (
                        <div
                          className="flex items-center justify-between border-t border-black/40 pt-1 mt-2 shrink-0 text-black/70"
                          style={{ fontSize: `${Math.max(8, settings.fontSize - 2)}pt` }}
                        >
                          <span>{settings.showFooter ? settings.footerText : ""}</span>
                          <span>
                            {settings.showPageNumbers
                              ? formatPageNum(pageIdx + 1, pages.length, settings.pageNumberFormat)
                              : ""}
                          </span>
                        </div>
                      )}
                    </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function QuestionBlock({
  q,
  index,
  settings,
}: {
  q: Question;
  index: number;
  settings: ProjectSettings;
}) {
  const labelRender = LABEL_STYLES.find((s) => s.id === settings.optionLabelStyle)!.render;
  const qNum = formatQNumber(index + 1, settings.questionNumberStyle);
  const hasFigure = q.items.length > 0;

  return (
    <div>
      <div className="flex gap-1">
        <span className="font-semibold shrink-0">{qNum}</span>
        <div className="flex-1">
          {q.text && <span>{q.text}</span>}
          {hasFigure && (
            <div
              className="relative mt-1 mb-1 border border-black/20 rounded-sm bg-white"
              style={{ height: `${Math.max(40, q.items.length * 18)}mm` }}
            >
              {q.items.map((it) => (
                <FigureItem key={it.id} item={it} />
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-3 mt-0.5">
            {q.options.map((o, i) => (
              <OptionCell
                key={o.id}
                label={labelRender(i)}
                text={o.text}
                correct={!!o.correct}
                tickStyle={q.tickStyle}
              />
            ))}
          </div>
          {q.footer && (
            <div className="text-[0.85em] italic text-black/60 mt-1">{q.footer}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function OptionCell({
  label,
  text,
  correct,
  tickStyle,
}: {
  label: string;
  text: string;
  correct: boolean;
  tickStyle: TickStyle;
}) {
  const showCircle = correct && tickStyle === "circle";
  const showSide = correct && tickStyle === "side";
  const greenRow = correct && tickStyle === "green";
  return (
    <div
      className={`flex items-start gap-1 ${greenRow ? "bg-emerald-100" : ""}`}
      style={greenRow ? { borderRadius: "2px", padding: "0 2px" } : undefined}
    >
      {showCircle ? (
        <span className="pdf-correct-circle">{label}</span>
      ) : (
        <span>({label})</span>
      )}
      <span className="flex-1">{text || <span className="text-black/30">—</span>}</span>
      {showSide && <span className="text-emerald-700 font-bold">✓</span>}
    </div>
  );
}

function FigureItem({ item }: { item: { id: string; kind: string; x: number; y: number; w: number; h: number; label?: string } }) {
  const style = {
    position: "absolute" as const,
    left: `${item.x * 100}%`,
    top: `${item.y * 100}%`,
    width: `${item.w * 100}%`,
    height: `${item.h * 100}%`,
    overflow: "hidden" as const,
  };
  if (item.kind === "text") {
    return <div style={style} className="text-[0.95em] whitespace-pre-wrap">{item.label}</div>;
  }
  return (
    <div style={style}>
      {/* @ts-expect-error pass-through kind */}
      <Shape kind={item.kind} label={item.label} className="w-full h-full" />
    </div>
  );
}
