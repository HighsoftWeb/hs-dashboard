"use client";

import React from "react";

export function SkeletonDataTable(): React.JSX.Element {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-9 w-80 rounded bg-slate-200" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-4">
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="h-3 w-16 rounded bg-slate-200" />
                    <div className="h-9 w-full rounded bg-slate-200" />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <div className="h-9 w-20 rounded bg-slate-200" />
                <div className="h-9 w-16 rounded bg-slate-200" />
              </div>
            </div>
          </div>

          <div className="rounded border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-2 py-2 border-b border-gray-100">
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-4 w-20 rounded bg-slate-200" />
                ))}
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="px-2 py-2 flex gap-4">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <div
                      key={j}
                      className={`h-4 rounded bg-slate-200 ${j === 2 ? "w-32" : j === 4 ? "w-24" : "w-16"}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
