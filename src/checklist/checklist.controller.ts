import { NextFunction, Request, Response } from "express";
import { check, validationResult } from "express-validator/check";
import { matchedData } from "express-validator/filter";

import { Checklist } from "./checklist.model";
import { DocumentTag } from "./documentTag.model";

export class ChecklistController {
  public static postValidator(): any {
    return [
      check("documentTitle")
        .trim()
        .exists()
        .not()
        .isEmpty()
        //.isAlphanumeric()
        .withMessage("Checklist document title is not valid")
    ];
  }

  // TODO: remove
  public static setUp(req: Request, res: Response, next: NextFunction): void | Response {
    const docTags = new DocumentTag({
      label: "test"
    });

    docTags.save(err => {
      return err
        ? next(err)
        : res.status(200).json({
            success: "You have successfully created a new tag.",
            docTagsId: docTags._id
          });
    });
  }

  public static get(req: Request, res: Response, next: NextFunction): void | Response {
    // TODO: check if owner is requesting and/or public=true
    Checklist.findById(req.params.cId, (err, checklist) => {
      return err ? next(err) : res.status(200).json(checklist);
    });
  }

  public static post(req: Request, res: Response, next: NextFunction): Response {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }

    // matchedData returns only the subset of data validated by Express Validator
    const validatedReq = matchedData(req);

    const checklist = new Checklist({
      parentChecklist: req.body.parentChecklist,
      owner: req.body.owner,
      public: req.body.public,
      documentTitle: validatedReq.documentTitle,
      documentTags: req.body.documentTags,
      checklistTags: req.body.checklistTags,
      customCss: req.body.customCss,
      sections: req.body.sections
    });

    checklist.save(err => {
      if (err) {
        return next(err);
      } else {
        return res.status(200).json({
          success: "You have successfully created a new checklist.",
          checklistId: checklist._id
        });
      }
    });
  }

  public static put(req: Request, res: Response, next: NextFunction): void | Response {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }

    // matchedData returns only the subset of data validated by Express Validator
    const validatedReq = matchedData(req);

    // TODO: confirm submitter is authorized to update
    Checklist.findById(req.params.cId, (err, checklist) => {
      if (err) {
        return next(err);
      }

      // TODO: make more efficient, only set updated values
      checklist.set({
        parentChecklist: req.body.parentChecklist,
        owner: req.body.owner,
        public: req.body.public,
        title: validatedReq.title,
        documentTags: req.body.documentTags,
        customCss: req.body.customCss,
        sections: req.body.sections
      });

      checklist.save(err => {
        return err
          ? next(err)
          : res.status(200).json({
              success: "You have successfully updated your checklist.",
              checklistId: checklist._id
            });
      });
    });
  }

  public static delete(req: Request, res: Response, next: NextFunction): void | Response {
    // TODO: confirm submitter is authorized to delete
    Checklist.findByIdAndRemove(req.params.cId, err => {
      return err
        ? next(err)
        : res.status(204).json({
            success: "You have successfully deleted your checklist."
          });
    });
  }
}